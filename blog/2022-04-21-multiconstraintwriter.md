---
title: "[Spring Batch] Custom constraint writer 구현"
date: 2022-04-21 15:35:00 +0900
tags: [spring-batch, item-writer, postgresql, partial-index, multi-constraint]
categories: [Spring Batch]
---

## 문제 상황 🧐

최근 `PostgreSQL` 의 `Upsert` 를 특정 로직에서 사용하는 배치를 설계했습니다. 구현 도중 비즈니스 사항의 변경으로 복합 유니크 조건에 특정 컬럼을 추가하게 되었는데요.

**복합 유니크 컬럼의 unique 조건은 특정 컬럼의 `null` 중복은 막지 못하는 점**이 문제가 되었습니다.

예제로 문제가 된 부분을 살펴보겠습니다.

```sql
create table student
(
    id    integer not null
        constraint student_pk
            primary key,
    name  varchar,
    major varchar,
    constraint student_unique
        unique (name, major)
);
```

| id | name | major |
| :--- | :--- | :--- |
| 1 | song | korean |
| 2 | kim | english |
| 3 | park | math |
| 4 | kim | NULL |
| 5 | kim | NULL |

`null` 중복을 허용하지 않기 위해서 자연스럽게 더미 데이터 삽입 방법이 생각났지만, **의미없는 데이터를 DB 에 저장하는 것에 거부감**이 들었습니다. 만약 `null` 이 발생하는 `column` 이 `UUID` 같이 복잡한 데이터를 저장하고 있는 `column` 이라면 의미없는 값은 다른 값들에 묻혀서 식별하기 매우 힘들어질게 뻔하기 때문입니다.

조금 귀찮을 수 있지만 `unique partial index` 을 사용하면 더미데이터를 넣지 않고도 `null` 을 허용하지 않을 수 있습니다. 힘들더라도 이상적인 방법을 최대한 추구해보겠습니다.

## 해결방안

### partial index

```sql
CREATE UNIQUE INDEX stu_2col_uni_idx ON student (name, major)
    WHERE major IS NOT NULL;

CREATE UNIQUE INDEX stu_1col_uni_idx ON student (name)
    WHERE major IS NULL;
```

`PostgreSQL` 은 부분 인덱스 기능을 제공합니다.

부분 인덱스
: 특정 조건을 만족한 경우에만 index 를 생성해주는 기능. index 의 범위를 줄여서 효율적인 index 생성 및 유지를 가능하게 합니다.

name 만 채워진 값이 `insert` 되면 `stu_1col_uni_idx` 은 **같은 name 일 때 major 가 `null` 인 row 는 단 하나만 허용**합니다. 두 인덱스를 상호보완적인 형태로 생성하여 교묘하게 특정 컬럼의 `null` 중복을 막는 방법입니다.

![duplicate error](/assets/img/duplicatekeyerror.webp)
_major 가 없는 값을 저장하려고 하면 error 가 발생_

하지만 이렇게 unique 조건이 두 개가 될 경우, `Upsert` 실행 시 constraint 체크는 단 하나만 허용하기 때문에 배치가 처음 의도대로 실행되지 않았습니다.

결국 고민을 거듭하다가 sql 을 실행시키기 전에 특정 값이 없는지 파악한 후, 조건에 맞는 sql 을 실행시키기로 했습니다.

### `SelectConstraintWriter` 구현

기존에 사용했던 `JdbcBatchItemWriter` 은 실행시킬 sql 을 하나만 가질 수 있습니다. 이 writer 를 상속하여 여러 sql 을 가질 수 있도록 해보겠습니다.

```java
public class SelectConstraintWriter extends JdbcBatchItemWriter<Student> {

    @Setter
    private String anotherSql;

    @Override
    public void write(List<? extends Student> items) {
        if (items.isEmpty()) {
            return;
        }

        List<? extends Student> existMajorStudents = items.stream()
                .filter(student -> student.getMajor() != null)
                .collect(toList());

        List<? extends Student> nullMajorStudents = items.stream()
                .filter(student -> student.getMajor() == null)
                .collect(toList());

        executeSql(existMajorStudents, sql);
        executeSql(nullMajorStudents, anotherSql);
    }

    private void executeSql(List<? extends student> students, String sql) {
        if (logger.isDebugEnabled()) {
            logger.debug("Executing batch with " + students.size() + " items.");
        }

        int[] updateCounts;

        if (usingNamedParameters) {
            if (this.itemSqlParameterSourceProvider == null) {
                updateCounts = namedParameterJdbcTemplate.batchUpdate(sql, students.toArray(new Map[students.size()]));
            } else {
                SqlParameterSource[] batchArgs = new SqlParameterSource[students.size()];
                int i = 0;
                for (student item : students) {
                    batchArgs[i++] = itemSqlParameterSourceProvider.createSqlParameterSource(item);
                }
                updateCounts = namedParameterJdbcTemplate.batchUpdate(sql, batchArgs);
            }
        } else {
            updateCounts = namedParameterJdbcTemplate.getJdbcOperations().execute(sql,
                    (PreparedStatementCallback<int[]>) ps -> {
                        for (student item : students) {
                            itemPreparedStatementSetter.setValues(item, ps);
                            ps.addBatch();
                        }
                        return ps.executeBatch();
                    });
        }

        if (assertUpdates) {
            for (int i = 0; i < updateCounts.length; i++) {
                int value = updateCounts[i];
                if (value == 0) {
                    throw new EmptyResultDataAccessException("Item " + i + " of " + updateCounts.length
                            + " did not update any rows: [" + students.get(i) + "]", 1);
                }
            }
        }
    }
}
```

`JdbcBatchItemWriter` 의 `write` method 를 `override` 하여 구현했습니다. major 의 유무를 코드 상에서 검사한 후 sql 을 선택하여 실행시킬 것이기 때문에, `duplicateKeyException` 대신 `Upsert` 구문이 제대로 동작하게 할 수 있습니다.

다음은 사용 예시입니다.

```java
@Bean
SelectConstraintWriter studentItemWriter() {
    String sql1 =
            "INSERT INTO student(id, name, major) "
                    + "VALUES (nextval('hibernate_sequence'), :name, :major) "
                    + "ON CONFLICT (name, major) WHERE major IS NOT NULL "
                    + "DO UPDATE "
                    + "SET name = :name, "
                    + "    major = :major";

    String sql2 =
            "INSERT INTO student(id, name, major) "
                    + "VALUES (nextval('hibernate_sequence'), :name, :major) "
                    + "ON CONFLICT (name) WHERE major IS NULL "
                    + "DO UPDATE "
                    + "SET name = :name, "
                    + "    major = :major";

    SelectConstraintWriter writer = new SelectConstraintWriter();
    writer.setSql(sql1);
    writer.setAnotherSql(sql2);
    writer.setDataSource(dataSource);
    writer.setItemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>());
    writer.afterPropertiesSet();
    return writer;
}
```

## Conclusion

`PostgreSQL` 이 `Upsert` 실행시 다중 constraint 체크를 허용해줬다면 이렇게까지 할 필요가 없었을 거라 아쉽네요. 추후 버전에서는 업데이트되길 기대해봅니다.

---

## Reference

[create unique constraint with null columns](https://stackoverflow.com/questions/8289100/create-unique-constraint-with-null-columns)
