---
title: "Changes in Spring Batch 5.0"
date: 2023-06-17 19:46:19 +0900
aliases: 
tags: [spring, batch, changes]
categories: [Spring Batch]
authors: haril
---

Here's a summary of the changes in Spring Batch 5.0.

## What's new?

### `@EnableBatchProcessing` is no longer recommended

In the past, you could activate Spring Batch's Spring Boot auto-configuration using the `@EnableBatchProcessing` annotation. However, now you need to remove it to use Spring Boot's auto-configuration. Specifying `@EnableBatchProcessing` or inheriting from `DefaultBatchConfiguration` now pushes back Spring Boot's auto-configuration and is used for customizing application settings.

Therefore, using `@EnableBatchProcessing` or `DefaultBatchConfiguration` will cause default settings like `spring.batch.jdbc.initialize-schema` not to work. Additionally, Jobs won't run automatically when Boot is started, so an implementation of a Runner is required.

### Multiple Job Execution is no longer supported

Previously, if there were multiple Jobs in a batch, you could execute them all at once. However, now Boot will execute a Job when it detects a single one. If there are multiple Jobs in the context, you need to specify the Job to be executed using `spring.batch.job.name` when starting Boot.

### Expanded JobParameter support

In Spring Batch v4, Job parameters could only be of types `Long`, `String`, `Date`, and `Double`. In v5, you can now implement converters to use any type as a JobParameter. However, the default conversion service in Spring Batch still does not support `LocalDate` and `LocalDateTime`, causing exceptions. Although you can resolve this by implementing a converter for the default conversion service, it is problematic that even though `JobParametersBuilder` provides related methods, the conversion does not actually occur and throws an exception. An [issue](https://github.com/spring-projects/spring-batch/issues/4257) has been opened regarding this, and it is expected to be fixed in `5.0.1`.

The issue was resolved in the release of 5.0.1 on 2023-02-23.

### initializeSchema

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/postgres?currentSchema=mySchema
    username: postgres
    password: 1234
    driver-class-name: org.postgresql.Driver
  batch:
    jdbc:
      initialize-schema: always
      table-prefix: mySchema.BATCH_
  sql:
    init:
      mode: always
```

Specify the `currentSchema` option for proper functioning.

## Reference

- [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide#spring-batch-changes)
- [What's New in Spring Batch 5.0](https://docs.spring.io/spring-batch/docs/current/reference/html/whatsnew.html#job-parameters-handling-updates)