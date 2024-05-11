---
title: "From Java to Printing Hello World: Part 1"
date: 2023-12-10 12:45:33 +0900
aliases: null
tags: [ java, compile, jvm ]
categories: [ Java ]
authors: haril
image: img/banner/hello-world-programmer.webp
description: "In the world of programming, it always starts with printing the sentence `Hello World`. It's like an unwritten rule. In this series, we will delve into the reasons behind the `Hello World` as the starting point, the compiled class files, and how the computer interprets and executes Java code."
---

![banner](./hello-world-programmer.webp)

In the world of programming, it always starts with printing the sentence `Hello World`. It's like an unwritten rule.

```python
# hello.py
print("Hello World")
```

```bash
python hello.py
// Hello World
```

Python? Excellent.

```js
// hello.js
console.log("Hello World");
```

```bash
node hello.js
// Hello World
```

JavaScript? Not bad.

```java
public class VerboseLanguage {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

```bash
javac VerboseLanguage.java
java VerboseLanguage
// Hello World
```

However, Java feels like it's from a different world. We haven't even mentioned yet that the class name must match the
file name.

What is `public`, what is `class`, what is `static`, and going through `void`, `main`, `String[]`,
and `System.out.println`, we finally reach the string "Hello World". ~~Now, let's go learn another
language.~~[^fn-nth-1]

Even for simply printing "Hello World", Java demands quite a bit of background knowledge. Why does Java require such
verbose processes?

This series is divided into 3 chapters. The goal is to delve into what happens behind the scenes to print the 2 words "
Hello World" in detail. The specific contents of each chapter are as follows:

- In the first chapter, we introduce the reasons behind the **Hello World as the starting point**.
- In the second chapter, we examine the **compiled class files and how the computer interprets and executes Java code**.
- Finally, we explore how the JVM loads and executes `public static void main` and the **operating principles** behind
  it.

By combining the contents of the 3 chapters, we can finally grasp the concept of "Hello World". It's quite a long
journey, so let's take a deep breath and embark on it.

## Chapter 1. Why?

Before printing Hello World in Java, there are several "why moments" that need to be considered.

### Why must the class name match the file name?

More precisely, it is the name of the `public` class that must match the file name. Why is that?

Java programs are not directly understandable by computers. A virtual machine called JVM assists the computer in
executing the program. To make a Java program executable by the computer, it needs to go through several steps to
convert it into machine code that the JVM can interpret. The first step is using a compiler to convert the program into
bytecode that the JVM can interpret. The converted bytecode is then passed through an interpreter inside the JVM to be
translated into machine code and executed.

Let's briefly look at the compilation process.

```java
public class Outer {
    public static void main(String[] args) {
        System.out.println("This is Outer class");
    }

    private class Inner {
    }
}
```

```bash
javac Outer.java
```

```text
Permissions Size User   Date Modified Name
.rw-r--r--   302 haril  30 Nov 16:09  Outer$Inner.class
.rw-r--r--   503 haril  30 Nov 16:09  Outer.class
.rw-r--r--   159 haril  30 Nov 16:09  Outer.java
```

Java **generates a `.class` file for every class at compile time**.

Now, the JVM needs to find the `main` method for program execution. How does it know where the `main` method is?

_Why does it have to find `main()` specifically? Just wait a little longer._

If the Java file name does not match the public class name, the Java interpreter has to read all class files to find
the `main` method. If the file name matches the name of the public class, the Java interpreter can better identify the
file it needs to interpret.

Imagine a file named `Java1000` with 1000 classes inside. To identify where `main()` is among the 1000 classes, the
interpreter would have to examine all the class files.

However, if the file name matches the name of the public class, it can access `main()` more quickly (since `main` exists
in the public class), and it can easily access other classes since all the logic starts from `main()`.

### Why must it be public?

The JVM needs to find the `main` method inside the class. If the JVM, which accesses the class from outside, needs to
find a method inside the class, that method must be `public`. In fact, changing the access modifier to `private` will
result in an error message instructing you to declare `main` as `public`.

```text
Error: Main method not found in class VerboseLanguage, please define the main method as:
   public static void main(String[] args)
```

### Why must it be static?

The JVM has found the `public main()` method. However, to invoke this method, an object must first be created. Does the
JVM need this object? No, it just needs to be able to call `main`. By declaring it as `static`, the JVM does not need to
create an unnecessary object, saving memory.

### Why must it be void?

The end of the `main` method signifies the end of Java's execution. The JVM cannot do anything with the return value
of `main`, so the presence of a return value is meaningless. Therefore, it is natural to declare it as `void`.

### Why must it be named main?

The method name `main` is designed for the JVM to **find the entry point for running the application**.

Although the term "design" sounds grand, in reality, it is hard-coded to find the method named `main`. If the name to be
found was not `main` but `haril`, it would have searched for a method named `haril`. Of course, the Java creators likely
had reasons for choosing `main`, but that's about it.

```c
mainClassName = GetMainClassName(env, jarfile);
mainClass = LoadClass(env, classname);

// Find the main method
mainID = (*env)->GetStaticMethodID(env, mainClass, "main", "([Ljava/lang/String;)V");

jbject obj = (*env)->ToReflectedMethod(env, mainClass, mainID, JNI_TRUE);
```

### Why args?

Until now, we omitted mentioning `String[] args` in `main()`. Why must this argument be specified, and why does an error
occur if it is omitted?

As `public static void main(String[] args)` is the entry point of a Java application, this argument must come from
outside the Java application.

> All types of standard input are entered as strings.

This is why `args` is declared as a string array. If you think about it, it makes sense. Before the Java application
even runs, can you create custom object types directly? 🤔

So why is `args` necessary?

By passing arguments in a simple way from outside to inside, you can change the behavior of a Java application, a
mechanism widely used since the early days of C programming to control program behavior. Especially for simple
applications, this method is very effective. **Java simply adopted this widely used method**.

The reason `String[] args` cannot be omitted is that Java only allows one `public static void main(String[] args)` as
the entry point. The Java creators thought it would be less confusing to declare and not use `args` than to allow it to
be omitted.

### System.out.println

Finally, we can start talking about the method related to output.

_Just to mention it again, in Python it was `print("Hello World")`. [^fn-nth-2]_

A Java program runs not directly on the operating system but on a virtual machine called JVM. This allows Java programs
to be executed anywhere regardless of the operating system, but it also makes it difficult to use specific functions
provided by the operating system. This is why coding at the system level, such as creating a CLI in Java or collecting
OS metrics, is challenging.

However, there is a way to leverage limited OS functionality (JNI), and `System` provides this functionality. Some of
the key functions include:

- Standard input
- **Standard output**
- Setting environment variables
- Terminating the running application and returning a status code

To print `Hello World`, we are using the standard output function of `System`.

In fact, as you follow the flow of `System.out.println`, you will encounter a `writeBytes` method with the `native`
keyword attached, which delegates the operation to C code and transfers it to standard output.

```java
// FileOutputStream.java
private native void writeBytes(byte b[], int off, int len, boolean append)
    throws IOException;
```

The invocation of a method with the `native` keyword works through the Java Native Interface (JNI). This will be covered
in a later chapter.

### String

Strings in Java are somewhat special. No, they seem quite special. They are allocated separate memory space, indicating
they are definitely treated as special. Why is that?

It is important to note the following properties of strings:

- They can become very large.
- They are relatively frequently reused.

Therefore, strings are designed with a focus on how to reuse them once created. To fully understand how large string
data is managed in memory, you need an understanding of the topics to be covered later. For now, let's briefly touch on
the principles of memory space saving.

First, let's look at how strings are declared in Java.

```java
String greeting = "Hello World";
```

Internally, it works as follows:

![](https://i.imgur.com/7j2HMrL.webp)

Strings are created in the String Constant Pool and have immutable properties. Once a string is created, it does not
change, and if the same string is found in the Constant Pool when creating a new string, it is reused.

_We will cover JVM Stack, Frame, Heap in the next chapter._

Another way to declare strings is by instantiation.

```java
String greeting = new String("Hello World");
```

This method is rarely used because there is a difference in internal behavior, as shown below.

![](https://i.imgur.com/pN25lbX.webp)

When a string is used directly without the `new` keyword, it is created in the String Constant Pool and can be reused.
However, if instantiated with the `new` keyword, it is not created in the Constant Pool. This means the same string can
be created multiple times, potentially wasting memory space.

### Summary

In this chapter, we answered the following questions:

- Why must the `.java` file name match the class name?
- Why must it be `public static void main(String[] args)`?
- The flow of the output operation
- The characteristics of strings and the basic principles of their creation and use

In the next chapter, we will compile Java code ourselves and explore how bytecode is generated, its relationship with
memory areas, and more.

## Reference

- [OpenJDK java.c](https://github.com/AdoptOpenJDK/openjdk-jdk8u/blob/master/jdk/src/share/bin/java.c)
- [OpenJDK](https://github.com/openjdk/jdk/tree/master)
- https://www.geeksforgeeks.org/java-main-method-public-static-void-main-string-args/
- https://www.geeksforgeeks.org/myth-file-name-class-name-java/
- https://www.includehelp.com/java/why-does-java-file-name-must-be-same-as-public-class-name.aspx
- https://www.devkuma.com/docs/java/system-class/
- [Inpa blog](https://inpa.tistory.com/entry/JAVA-%E2%98%95-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%8A%94-%EC%96%B8%EC%A0%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC%EC%97%90-%EB%A1%9C%EB%94%A9-%EC%B4%88%EA%B8%B0%ED%99%94-%EB%90%98%EB%8A%94%EA%B0%80-%E2%9D%93#jvm%EC%9D%98_%ED%81%B4%EB%9E%98%EC%8A%A4_%EB%A1%9C%EB%8D%94_class_loader)
- https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-2.html#jvms-2.5
- https://www.baeldung.com/java-jvm-run-time-data-areas
- https://sgcomputer.tistory.com/64
- https://johngrib.github.io/wiki/java/run-time-constant-pool/
- https://johngrib.github.io/wiki/jvm-stack/
- https://code-run.tistory.com/8
- https://www.baeldung.com/java-command-line-arguments

[^fn-nth-1]: [Life Coding Python](https://www.opentutorials.org/course/4769)
[^fn-nth-2]: [Life Coding Python](https://www.opentutorials.org/course/4769)
[^fn-nth-3]: https://www3.ntu.edu.sg/home/ehchua/programming/java/J3d_String.html
