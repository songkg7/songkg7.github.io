---
title: "[Spring Batch] Implementing Custom Constraint Writer"
date: 2022-04-21 15:35:00 +0900
tags: [spring-batch, item-writer, postgresql, partial-index, multi-constraint]
categories: [Spring Batch]
authors: haril
---

## Situation 🧐

Recently, I designed a batch process that uses `Upsert` in `PostgreSQL` for a specific logic. During implementation, due to a change in business requirements, I had to add a specific column to a composite unique condition.

The issue arose from the fact that the unique constraint of the composite unique column does not prevent duplicates with `null` values in a specific column.

Let's take a look at an example of the problematic situation.

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

To avoid allowing `null` duplicates, the idea of inserting dummy data naturally came to mind, but I felt reluctant to store meaningless data in the database. Especially if the column where `null` occurs stores complex data like `UUID`, it would be very difficult to identify meaningless values buried among other values.

Although it may be a bit cumbersome, using a `unique partial index` allows us to disallow `null` values without inserting dummy data. I decided to pursue the most ideal solution, even if it is challenging.

## Solution

### Partial Index

```sql
CREATE UNIQUE INDEX stu_2col_uni_idx ON student (name, major)
    WHERE major IS NOT NULL;

CREATE UNIQUE INDEX stu_1col_uni_idx ON student (name)
    WHERE major IS NULL;
```

`PostgreSQL` provides the functionality of partial indexes.

Partial Index
: A feature that creates an index only when certain conditions are met. It allows for efficient index creation and maintenance by narrowing the scope of the index.

When a value with only `name` is inserted, `stu_1col_uni_idx` allows only one row with the same `name` where `major` is `null`. By creating two complementary indexes, we can skillfully prevent duplicates with `null` values in a specific column.

![duplicate error](./duplicatekeyerror.webp)
_An error occurs when trying to store a value without `major`_

However, when there are two unique constraints like this, since only one constraint check is allowed during `Upsert` execution, the batch did not run as intended.

After much deliberation, I decided to check if a specific value is missing before executing the SQL and then execute the SQL that meets the conditions.

### Implementing `SelectConstraintWriter`

I implemented this by overriding the `write` method of the `JdbcBatchItemWriter` that was previously used. By checking the presence of `major` in the code and selecting and executing the appropriate SQL, we can ensure that the `Upsert` statement works correctly instead of encountering a `duplicateKeyException`.

Here is an example of usage:

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

It's regrettable that if `PostgreSQL` allowed multiple constraint checks during `Upsert` execution, we wouldn't have needed to go to such lengths. I hope for updates in future versions.

---

## Reference

[create unique constraint with null columns](https://stackoverflow.com/questions/8289100/create-unique-constraint-with-null-columns)