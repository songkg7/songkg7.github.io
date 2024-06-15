---
title: "[Kotlin] 拡張されたループ"
date: 2022-03-26 10:22:00 +0900
tags: [kotlin, loop]
categories: [Kotlin]
authors: haril
---

Kotlinでは、Javaに比べてはるかにシンプルで便利なループを書くことができます。どのように使うか見てみましょう。

### 1. `..` 演算子

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for (index in 0..fruits.size - 1) {
        val fruit = fruits[index]
        println("$index: $fruit")
    }
}
```

`..` を使うと、1ずつインクリメントする従来のループが作成されます。

### 2. `downTo`

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for (index in fruits.size - 1 downTo 0) {
        val fruit = fruits[index]
        println("$index: $fruit")
    }
}
```

`downTo` を使うと、期待通りにデクリメントするループが作成されます。

### 3. `step`

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for (index in 0..fruits.size - 1 step 2) {
        val fruit = fruits[index]
        println("$index: $fruit")
    }
}
```

`step` キーワードを使うと、特定の数の要素をスキップするループを実装できます。これは `downTo` にも適用されます。

### 4. `until`

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for (index in 0 until fruits.size) {
        val fruit = fruits[index]
        println("$index: $fruit")
    }
}
```

`until` を使うと、最後の数を含まないループが作成され、`-1` を使う必要がなくなります。

### 5. lastIndex

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for (index in 0 .. fruits.lastIndex) {
        val fruit = fruits[index]
        println("$index: $fruit")
    }
}
```

`lastIndex` プロパティを使うと、ループが読みやすくなります。しかし、もちろんまだ他にも方法があります。

### 6. indices

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for (index in fruits.indices) {
        val fruit = fruits[index]
        println("$index: $fruit")
    }
}
```

`indices` はコレクションのインデックス範囲を返します。

### 7. `withIndex()`

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for ((index, fruit) in fruits.withIndex()) {
        println("$index: $fruit")
    }
}
```

`withIndex()` を使うと、インデックスと値を同時に抽出でき、コードがシンプルになります。これはPythonのシンプルさに似ています。これでほとんどのループシナリオに対応できますが、もう一つ方法があります。

### 8. forEachIndexed

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    fruits.forEachIndexed { index, fruit ->
        println("$index: $fruit")
    }
}
```

`forEachIndexed` にラムダ関数を使うと、コードがより簡潔で直感的になります。ニーズに合った適切な方法を選びましょう。

---

## 参考

[Kotlin Tips: Loops](https://www.youtube.com/watch?v=i-kyPp1qFBA)