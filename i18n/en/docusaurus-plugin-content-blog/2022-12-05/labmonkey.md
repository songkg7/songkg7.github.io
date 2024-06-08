---
title: "Fixture Monkey 0.4.x"
date: 2022-12-05 17:14:00 +0900
aliases:
tags: [fixture, test, naver, open-source]
categories:
authors: haril
---

:::warning

As of May 2024, this post is no longer valid.
Instead, please refer to [Making Testing Easy and Convenient with Fixture Monkey](https://haril.dev/blog/2024/02/03/Fixture-Monkey).

:::

## Overview

With the update to `FixtureMonkey` version `0.4.x`, there have been significant changes in functionality. It has only been a month since the [previous post](https://haril.dev/blog/2022/09/19/Fixture-monkey-overview)[^footnote], and there have been many modifications (ㅠ) which was a bit overwhelming, but taking comfort in the active community, I am writing a new post reflecting the updated features.

## Changes

### LabMonkey

An experimental feature has been added as an instance.

`LabMonkey` inherits from `FixtureMonkey` and supports existing features while adding several new methods. The overall usage is similar, so it seems that using `LabMonkey` instead of `FixtureMonkey` would be appropriate. It is said that after version `1.0.0`, the functionality of `LabMonkey` will be deprecated, and the same features will be provided by `FixtureMonkey`.

```java
private final LabMonkey fixture = LabMonkey.create();
```

### Change in Object Creation Method

The responsibility has shifted from `ArbitraryGenerator` to `ArbitraryIntrospector`.

### Record Support

Now, you can also create `Record` through `FixtureMonkey`.

```java
public record LottoRecord(int number) {}
```

```java
class LottoRecordTest {

    private final LabMonkey fixture = LabMonkey.labMonkeyBuilder()
            .objectIntrospector(ConstructorPropertiesArbitraryIntrospector.INSTANCE)
            .build();

    @Test
    void shouldBetween1to45() {
        LottoRecord lottoRecord = fixture.giveMeOne(LottoRecord.class);

        System.out.println("lottoRecord: " + lottoRecord);

        assertThat(lottoRecord).isNotNull();
    }
}
```

```console
lottoRecord: LottoRecord[number=-6]
```

By using `ConstructorPropertiesArbitraryIntrospector` to create objects, you can create Record objects. In version `0.3.x`, the `ConstructorProperties` annotation was required, but now you don't need to make changes to the production code, which is quite a significant change.

In addition, various `Introspectors` exist to support object creation in a way that matches the shape of the object.

### Plugin

```java
private final LabMonkey fixture = LabMonkey.labMonkeyBuilder()
    .objectIntrospector(ConstructorPropertiesArbitraryIntrospector.INSTANCE)
    .plugin(new JavaxValidationPlugin())
    .build();
```

Through the fluent API `plugin()`, you can easily add plugins. By adding `JavaxValidationPlugin`, you can apply Java Bean Validation functionality to create objects.

It seems like a kind of decorator pattern, making it easier to develop and apply various third-party plugins.

```java
public record LottoRecord(
        @Min(1)
        @Max(45)
        int number
) {
    public LottoRecord {
        if (number < 1 || number > 45) {
            throw new IllegalArgumentException("The lotto number must be between 1 and 45.");
        }
    }
}
```

```java
@RepeatedTest(100)
void shouldBetween1to45() {
    LottoRecord lottoRecord = fixture.giveMeOne(LottoRecord.class);

    assertThat(lottoRecord.number()).isBetween(1, 45);
}
```

## Conclusion

Most of the areas that were mentioned as lacking in the previous post have been improved, and I am very satisfied with using it. But somehow, the documentation[^fn-nth-2] seems a bit lacking compared to before...

## Reference

[^footnote]: [FixtureMonkey 0.3.0 - Object Creation Strategy](https://naver.github.io/fixture-monkey/kr/)

[^fn-nth-2]: [FixtureMonkey](https://naver.github.io/fixture-monkey/kr/)
