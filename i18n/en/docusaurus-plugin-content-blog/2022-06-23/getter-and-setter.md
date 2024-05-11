---
title: The Truth and Misconceptions about Getters and Setters
date: 2022-06-23 10:22:00 +0900
tags: [java, getter, setter, oop, encapsulation]
categories: [Java]
authors: haril
---

When you search for `getter/setter` on Google, you'll find a plethora of articles. Most of them explain the reasons for using `getter/setter`, often focusing on keywords like encapsulation and information hiding.

The common explanation is that by declaring field variables as `private` to prevent external access and only exposing them through `getter/setter`, encapsulation is achieved.

However, does using `getter/setter` truly encapsulate data?

In reality, **`getter/setter` cannot achieve encapsulation at all.** To achieve encapsulation, one should avoid using getters and setters. To understand this, it is necessary to have a clear understanding of encapsulation.

## What is Encapsulation?

> Encapsulation in object-oriented programming has two aspects: bundling an object's attributes (data fields) and behaviors (methods) together and hiding some of the object's implementation details internally. - Wikipedia

**Encapsulation means that the external entities should not have complete knowledge of an object's internal attributes.**

## Why Getters and Setters Fail to Encapsulate

As we have learned, encapsulation dictates that external entities should not know the internal attributes of an object. However, `getter/setter` blatantly exposes the fact that a specific field exists to the outside world. Let's look at an example.

### Example

```java
public class Student {

    private String name;
    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String introduce() {
        return String.format("My name is %s and I am %d years old.", name, age);
    }
}
```

```java
class StudentTest {

    @Test
    void student() {
        Student student = new Student();
        student.setName("John");
        student.setAge(20);
        String introduce = student.introduce();

        assertThat(student.getName()).isEqualTo("John");
        assertThat(student.getAge()).isEqualTo(20);
        assertThat(introduce).isEqualTo("My name is John and I am 20 years old.");
    }
}
```

From outside the `Student` class, it is evident that it has attributes named `name` and `age`. Can we consider this state as encapsulated?

If the `age` attribute were to be removed from `Student`, changes would need to be made everywhere `getter/setter` is used. This creates strong coupling.

True encapsulation means that modifications to an object's internal structure should not affect the external entities, except for the public interface.

Let's try to hide the internal implementation.

```java
public class Student {

    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String introduce() {
        return String.format("My name is %s and I am %d years old.", name, age);
    }
}
```

```java
class StudentTest {

    @Test
    void student() {
        Student student = new Student("John", 20);
        String introduce = student.introduce();

        assertThat(introduce).isEqualTo("My name is John and I am 20 years old.");
    }
}
```

Now, the object does not expose its internal implementation through the public interface. It is not possible to know what data it holds, prevent it from being modified, and only communicate through messages.

## Conclusion

Encapsulation is a crucial topic in object-oriented design, emphasizing designs that are not dependent on external factors. Opinions vary on the level of encapsulation, with some advocating against using both `getter` and `setter` and others suggesting that using `getter` is acceptable.

Personally, I believe in avoiding `getter` usage as much as possible, but there are situations, especially in testing, where having getters or setters can make writing test code easier. Deciding on the level of encapsulation depends on the current situation and the purpose of the code being developed.

Good design always emerges through the process of trade-offs.

:::info

All example codes can be found on [GitHub](https://github.com/songkg7/java-practice/blob/main/basic-syntax/src/main/java/basicsyntax/getterandsetter/Student.java).

:::