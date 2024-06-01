---
title: "[Jacoco] Aggregating Jacoco Reports for Multi-Module Projects"
date: 2022-07-29 23:04:00 +0900
tags: [jacoco, java, gradle, test, aggregation-report]
categories: [Java]
authors: haril
---

## Overview

Starting from Gradle 7.4, a feature has been added that allows you to aggregate multiple Jacoco test reports into a single, unified report. In the past, it was very difficult to view the test results across multiple modules in one file, but now it has become much more convenient to merge these reports.

## Usage

### Creating a Submodule Solely for Collecting Reports

The current project structure consists of a module named `application` and other modules like `list` and `utils` that are used by the `application` module.

By adding a `code-coverage-report` module, we can collect the test reports from the `application`, `list`, and `utils` modules.

The project structure will then look like this:

- application
- utils
- list
- code-coverage-report

### Adding the jacoco-report-aggregation Plugin

```gradle
// code-coverage-report/build.gradle
plugins {
    id 'base'
    id 'jacoco-report-aggregation'
}

repositories {
    mavenCentral()
}

dependencies {
    jacocoAggregation project(":application")
}
```

Now, by running `./gradlew testCodeCoverageReport`, you can generate a Jacoco report that aggregates the test results from all modules.

![jacoco-directory](./jacoco-aggregation-directory.webp)

:::warning

To use the aggregation feature, a jar file is required. If you have set `jar { enable = false }`, you need to change it to true.

:::

### Update 22-09-28

In the case of a Gradle multi-project setup, there is an issue where packages that were properly excluded in a single project are not excluded in the aggregate report.

By adding the following configuration, you can generate a report that excludes specific packages.

```gradle
testCodeCoverageReport {
    reports {
        csv.required = true
        xml.required = false
    }
    getClassDirectories().setFrom(files(
        [project(':api'), project(':utils'), project(':core')].collect {
            it.fileTree(dir: "${it.buildDir}/classes/java/main", exclude: [
                '**/dto/**',
                '**/config/**',
                '**/output/**',
            ])
        }
    ))
}
```

## Next Step

The `jvm-test-suite` plugin, which is introduced alongside `jacoco-aggregation-report` in Gradle, also seems very useful. Since these plugins are complementary, it would be beneficial to use them together.

## Reference

- [Gradle 7.4 Release Notes](https://docs.gradle.org/7.4/release-notes.html)
