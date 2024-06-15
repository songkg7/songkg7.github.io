---
title: "[Kotlin] 中置関数"
categories: [Kotlin]
date: 2022-04-01 22:23:00 +0900
tags: [kotlin, infix-functions]
authors: haril
---

Kotlinでは、中置関数と呼ばれる関数の定義方法があります。これは、Javaを主要な言語として使用していた時には想像もできなかった構文です。Kotlinを始めたばかりの方に向けて、これを紹介しましょう。

単一のパラメータを持つメンバー関数は、中置関数に変換することができます。

中置関数の代表的な例の一つに、標準ライブラリに含まれている `to` 関数があります。

```kotlin
val pair = "Ferrari" to "Katrina"
println(pair)
// (Ferrari, Katrina)
```

必要に応じて、`to` のような新しい中置関数を定義することもできます。例えば、`Int` を次のように拡張することができます：

```kotlin
infix fun Int.times(str: String) = str.repeat(this)
println(2 times "Hello ")
// Hello Hello
```

`to` を新しい中置関数 `onto` として再定義したい場合は、次のように書くことができます：

```kotlin
infix fun String.onto(other: String) = Pair(this, other)
val myPair = "McLaren" onto "Lucas"
println(myPair)
// (McLaren, Lucas)
```

このようなKotlinの構文により、非常に独特なコーディング方法が可能になります。

```kotlin
class Person(val name: String) {
    val likedPeople = mutableListOf<Person>()

    infix fun likes(other: Person) {
        likedPeople.add(other)
    }
}

fun main() {
    val sophia = Person("Sophia")
    val claudia = Person("Claudia")

    sophia likes claudia // !!
}
```

---

### 参考

[Kotlin Docs](https://play.kotlinlang.org/byExample/01_introduction/02_Functions)