---
title: "[Java] Making First Collection More Collection-like - Iterable"
date: 2022-07-15 20:00:00 +0900
tags: [java, iterable, iterator]
categories: [Java]
authors: haril
description: "In this article, we introduce a way to make first-class collections more like a real Collection using Iterable."
---

## Overview

```java
// Java Collection that implements Iterable.
public interface Collection<E> extends Iterable<E>
```

First-class collections are a very useful way to handle objects. However, despite the name "first-class collection," it only holds `Collection` as a field and is not actually a `Collection`, so you cannot use the various methods provided by `Collection`. In this article, we introduce a way to make first-class collections more like a real `Collection` using `Iterable`.

Let's look at a simple example.

## Example

```java
@Value
public class LottoNumber {
    int value;

    public static LottoNumber create(int value) {
        return new LottoNumber(value);
    }
}
```

```java
public class LottoNumbers {

    private final List<LottoNumber> lottoNumbers;

    private LottoNumbers(List<LottoNumber> lottoNumbers) {
        this.lottoNumbers = lottoNumbers;
    }

    public static LottoNumbers create(LottoNumber... numbers) {
        return new LottoNumbers(List.of(numbers));
    }

    // Delegates isEmpty() method to use List's methods.
    public boolean isEmpty() {
        return lottoNumbers.isEmpty();
    }
}
```

`LottoNumbers` is a first-class collection that holds `LottoNumber` as a list. To check if the list is empty, we have implemented `isEmpty()`.

Let's write a simple test for `isEmpty()`.

```java
@Test
void isEmpty() {
    LottoNumber lottoNumber = LottoNumber.create(7);
    LottoNumbers lottoNumbers = LottoNumbers.create(lottoNumber);

    assertThat(lottoNumbers.isEmpty()).isFalse();
}
```

It's not bad, but `AssertJ` provides various methods to test collections.

- `has..`
- `contains...`
- `isEmpty()`

You cannot use these convenient assert methods with first-class collections because they do not have access to them due to not being a `Collection`.

More precisely, you cannot use them because **you cannot iterate over the elements** without `iterator()`. To use `iterator()`, you just need to implement `Iterable`.

The implementation is very simple.

```java
public class LottoNumbers implements Iterable<LottoNumber> {

    //...

    @Override
    public Iterator<LottoNumber> iterator() {
        return lottoNumbers.iterator();
    }
}
```

Since first-class collections already have `Collection`, you can simply return it just like you delegated `isEmpty()`.

```java
@Test
void isEmpty_iterable() {
    LottoNumber lottoNumber = LottoNumber.create(7);
    LottoNumbers lottoNumbers = LottoNumbers.create(lottoNumber);

    assertThat(lottoNumbers).containsExactly(lottoNumber);
    assertThat(lottoNumbers).isNotEmpty();
    assertThat(lottoNumbers).hasSize(1);
}
```

Now you can use various test methods.

Not only in tests but also in functionality implementation, you can conveniently use it.

```java
for (LottoNumber lottoNumber : lottoNumbers) {
    System.out.println("lottoNumber: " + lottoNumber);
}
```

This is possible because the `for` loop uses `iterator()`.

## Conclusion

By implementing `Iterable`, you can use much richer functionality. The implementation is not difficult, and it is close to extending functionality, so if you have a first-class collection, actively utilize `Iterable`.
