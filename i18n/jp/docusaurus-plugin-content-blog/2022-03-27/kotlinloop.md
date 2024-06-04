---
title: "[Kotlin] Enhanced Loops"
date: 2022-03-26 10:22:00 +0900
tags: [kotlin, loop]
categories: [Kotlin]
authors: haril
---

In Kotlin, you can write much simpler and more convenient loops compared to Java. Let's see how you can use them.

### 1. `..` operator

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for (index in 0..fruits.size - 1) {
        val fruit = fruits[index]
        println("$index: $fruit")
    }
}
```

Using `..` creates a traditional loop that increments by 1.

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

Using `downTo` creates a loop that decrements as expected.

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

With the `step` keyword, you can implement a loop that skips a specific number of elements. This also applies to `downTo`.

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

Using `until` creates a loop that does not include the last number, eliminating the need for `-1`.

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

Now, using the `lastIndex` property, loops start to become easier to read. But of course, there's more to explore.

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

`indices` returns the index range of the collection.

### 7. `withIndex()`

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    for ((index, fruit) in fruits.withIndex()) {
        println("$index: $fruit")
    }
}
```

By using `withIndex()`, extracting both index and value simultaneously simplifies the code, resembling Python's simplicity. This should be sufficient for most loop scenarios, but there's one more method left.

### 8. forEachIndexed

```kotlin
val fruits = listOf("Apple", "Banana", "Cherry", "Durian")

fun main() {
    fruits.forEachIndexed { index, fruit ->
        println("$index: $fruit")
    }
}
```

Using a lambda function with `forEachIndexed` can make the code more concise, intuitive, and straightforward. Choose the appropriate method that suits your needs.

---

## Reference

[Kotlin Tips: Loops](https://www.youtube.com/watch?v=i-kyPp1qFBA)