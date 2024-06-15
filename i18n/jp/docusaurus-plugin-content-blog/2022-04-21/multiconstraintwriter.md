---
title: "[Spring Batch] カスタム制約ライターの実装"
date: 2022-04-21 15:35:00 +0900
tags: [ spring-batch, item-writer, postgresql, partial-index, multi-constraint ]
categories: [ Spring Batch ]
authors: haril
---

## 状況 🧐

最近、特定のロジックのために `PostgreSQL` で `Upsert` を使用するバッチプロセスを設計しました。実装中に、ビジネス要件の変更により、複合一意条件に特定のカラムを追加する必要がありました。

問題は、複合一意カラムの一意制約が、特定のカラムに `null` 値が含まれている場合に重複を防止しないことから発生しました。

問題の状況を例で見てみましょう。

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

| id | name | major   |
|:---|:-----|:--------|
| 1  | song | korean  |
| 2  | kim  | english |
| 3  | park | math    |
| 4  | kim  | NULL    |
| 5  | kim  | NULL    |

`null` の重複を避けるために、ダミーデータを挿入するというアイデアが自然に浮かびましたが、データベースに意味のないデータを保存するのは気が進みませんでした。特に、`null` が発生するカラムが `UUID` のような複雑なデータを保存する場合、他の値の中に埋もれた意味のない値を識別するのは非常に困難です。

少し面倒ではありますが、`unique partial index` を使用することで、ダミーデータを挿入せずに `null` 値を許可しないようにすることができます。私は、たとえ挑戦的であっても、最も理想的な解決策を追求することにしました。

## 解決策

### 部分インデックス

```sql
CREATE UNIQUE INDEX stu_2col_uni_idx ON student (name, major)
    WHERE major IS NOT NULL;

CREATE UNIQUE INDEX stu_1col_uni_idx ON student (name)
    WHERE major IS NULL;
```

`PostgreSQL` は部分インデックスの機能を提供しています。

部分インデックス
: 特定の条件が満たされた場合にのみインデックスを作成する機能。インデックスの範囲を絞ることで、効率的なインデックス作成とメンテナンスが可能になります。

`name` のみの値が挿入される場合、`stu_1col_uni_idx` は `major` が `null` の同じ `name` を持つ行を1行のみ許可します。2つの補完的なインデックスを作成することで、特定のカラムに `null` 値が含まれる重複を巧妙に防ぐことができます。

![duplicate error](./duplicatekeyerror.webp)
_`major` がない値を保存しようとするとエラーが発生します_

しかし、このように2つの一意制約がある場合、`Upsert` 実行中に1つの制約チェックしか許可されないため、バッチは意図した通りに実行されませんでした。

多くの検討の末、SQLを実行する前に特定の値が欠落しているかどうかを確認し、条件を満たすSQLを実行することにしました。

### `SelectConstraintWriter` の実装

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

以前使用していた `JdbcBatchItemWriter` の `write` メソッドをオーバーライドすることでこれを実装しました。コード内で `major` の存在を確認し、適切なSQLを選択して実行することで、`duplicateKeyException` に遭遇することなく `Upsert` ステートメントが正しく動作するようにします。

使用例は以下の通りです：

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

## 結論

`PostgreSQL` が `Upsert` 実行中に複数の制約チェックを許可していれば、ここまでの手間をかける必要はなかったのは残念です。将来のバージョンでの更新を期待しています。

---

## 参考

[create unique constraint with null columns](https://stackoverflow.com/questions/8289100/create-unique-constraint-with-null-columns)