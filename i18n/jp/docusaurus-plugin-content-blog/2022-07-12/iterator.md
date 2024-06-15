---
title: "[Java] コレクションをよりコレクションらしくする - Iterable"
date: 2022-07-15 20:00:00 +0900
tags: [java, iterable, iterator]
categories: [Java]
authors: haril
description: "この記事では、ファーストクラスコレクションをIterableを使ってより実際のコレクションに近づける方法を紹介します。"
---

## 概要

```java
// Iterableを実装するJavaのコレクション。
public interface Collection<E> extends Iterable<E>
```

ファーストクラスコレクションはオブジェクトを扱う上で非常に便利な方法です。しかし、「ファーストクラスコレクション」という名前にもかかわらず、実際には`Collection`をフィールドとして保持しているだけで、実際には`Collection`ではないため、`Collection`が提供するさまざまなメソッドを使用することはできません。この記事では、`Iterable`を使用してファーストクラスコレクションをより実際の`Collection`に近づける方法を紹介します。

簡単な例を見てみましょう。

## 例

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

    // Listのメソッドを使用するためにisEmpty()メソッドを委譲します。
    public boolean isEmpty() {
        return lottoNumbers.isEmpty();
    }
}
```

`LottoNumbers`は`LottoNumber`をリストとして保持するファーストクラスコレクションです。リストが空かどうかを確認するために、`isEmpty()`を実装しています。

`isEmpty()`の簡単なテストを書いてみましょう。

```java
@Test
void isEmpty() {
    LottoNumber lottoNumber = LottoNumber.create(7);
    LottoNumbers lottoNumbers = LottoNumbers.create(lottoNumber);

    assertThat(lottoNumbers.isEmpty()).isFalse();
}
```

悪くはありませんが、`AssertJ`はコレクションをテストするためのさまざまなメソッドを提供しています。

- `has..`
- `contains...`
- `isEmpty()`

ファーストクラスコレクションは`Collection`ではないため、これらの便利なアサートメソッドを使用することはできません。

より正確には、**`iterator()`がないと要素を反復処理できない**ため、これらを使用することができません。`iterator()`を使用するには、`Iterable`を実装するだけです。

実装は非常に簡単です。

```java
public class LottoNumbers implements Iterable<LottoNumber> {

    //...

    @Override
    public Iterator<LottoNumber> iterator() {
        return lottoNumbers.iterator();
    }
}
```

ファーストクラスコレクションはすでに`Collection`を持っているので、`isEmpty()`を委譲したのと同じように、単にそれを返すだけです。

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

これでさまざまなテストメソッドを使用できるようになりました。

テストだけでなく、機能の実装においても便利に使用できます。

```java
for (LottoNumber lottoNumber : lottoNumbers) {
    System.out.println("lottoNumber: " + lottoNumber);
}
```

これは`for`ループが`iterator()`を使用するため可能です。

## 結論

`Iterable`を実装することで、より豊富な機能を使用することができます。実装は難しくなく、機能拡張に近いので、ファーストクラスコレクションを持っている場合は積極的に`Iterable`を活用しましょう。