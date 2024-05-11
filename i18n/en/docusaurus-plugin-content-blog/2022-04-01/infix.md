---
title: "[Kotlin] Infix Functions"
categories: [Kotlin]
date: 2022-04-01 22:23:00 +0900
tags: [kotlin, infix-functions]
authors: haril
---

In Kotlin, there is a method of defining functions called Infix functions, which is a syntax that was unimaginable while using Java as the primary language. Let's introduce this for those who are starting with Kotlin.

Member functions with a single parameter can be converted into Infix functions.

One of the prominent examples of Infix functions is the `to` function included in the standard library.

```kotlin
val pair = "Ferrari" to "Katrina"
println(pair)
// (Ferrari, Katrina)
```

You can define new Infix functions like `to` as needed. For example, you can extend `Int` as follows:

```kotlin
infix fun Int.times(str: String) = str.repeat(this)
println(2 times "Hello ")
// Hello Hello
```

If you want to redefine `to` as a new Infix function called `onto`, you can write it as follows:

```kotlin
infix fun String.onto(other: String) = Pair(this, other)
val myPair = "McLaren" onto "Lucas"
println(myPair)
// (McLaren, Lucas)
```

Such Kotlin syntax enables quite unconventional coding methods.

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

### Reference

[Kotlin Docs](https://play.kotlinlang.org/byExample/01_introduction/02_Functions)
