---
title: "From Java to Printing Hello World: Part 3"
date: 2024-01-07 17:08:34 +0900
aliases: null
tags: [ java, jvm ]
image: img/banner/hello-world-programmer.webp
categories: null
authors: haril
description: "In this chapter, we will explore how the JVM executes the 'Hello World' code block."
---

![banner](./hello-world-programmer.webp)

In the previous chapter, we compiled Java and examined the bytecode structure. In this chapter, we will explore how the
JVM executes the 'Hello World' code block.

## Chapter 3: Running Java on the JVM

- Class Loader
- Java Virtual Machine
- Java Native Interface
- JVM Memory Loading Process
- Interaction of Hello World with Memory Areas

### Class Loader

To understand when, where, and how Java classes are loaded into memory and initialized, we need to first look at the *
*Class Loader** of the JVM.

The class loader dynamically loads compiled Java class files (.class) and places them in the Runtime Data Area, which is
the memory area of the JVM.

The process of loading class files by the class loader consists of three stages:

1. Loading: Bringing the class file into **JVM memory**.
2. Linking: The process of **verifying** the class file for use.
3. Initialization: Initializing the class file with appropriate values.

It is important to note that class files are not loaded into memory all at once but are dynamically loaded into memory *
*when needed by the application**.

A common misconception is the timing of when classes or static members within classes are loaded into memory. Many
mistakenly believe that all classes and static members are loaded into memory as soon as the source is executed.
However, static members are only loaded into memory when the class is dynamically loaded into memory upon calling a
member within the class.

By using the verbose option, you can observe the process of loading into memory.

```bash
java -verbose:class VerboseLanguage
```

![image](https://i.imgur.com/4suH8mS.png)

You can see that the `VerboseLanguage` class is loaded before 'Hello World' is printed.

:::info

Java 1.8 and Java 21 have different log output formats starting from the compilation results. As versions progress,
optimizations are made and compiler behavior changes slightly, so it is important to check the version. This article
uses Java 21 as the default version, and other versions will be specified separately.

:::

### Runtime Data Area

The Runtime Data Area is the space where data is stored during program execution. It is divided into Shared Data Areas
and Per-thread Data Areas.

#### Shared Data Areas

Within the JVM, there are several areas where data can be shared among multiple threads running within the JVM. This
allows various threads to access one of these areas simultaneously.

##### Heap

> Where instances of the `VerboseLanguage` class exist

The Heap area is where all Java objects or arrays are allocated when created. It is created when the JVM starts and is
destroyed when the JVM exits.

According to the Java specification, this space should be automatically managed. This role is performed by a tool known
as the Garbage Collector (GC).

There are no constraints on the size of the Heap specified in the JVM specification. Memory management is also left to
the JVM implementation. However, if the Garbage Collector fails to secure enough space to create new objects, the JVM
will throw an OutOfMemory error.

##### Method Area

The Method Area is a shared data area that stores class and interface definitions. Similar to the Heap, it is created
when the JVM starts and is destroyed when the JVM exits.

Global variables and static variables of a class are stored in this area, making them accessible from anywhere in the
program from start to finish. (= Run-Time Constant Pool)

Specifically, the class loader loads the bytecode (.class) of a class and passes it to the JVM, which then generates the
internal representation of the class used for creating objects and invoking methods. This internal representation
collects information about fields, methods, and constructors of the class and interfaces.

In fact, according to the JVM specification, the Method Area is an area with no clear definition of 'how it should be'.
It is a **logical area** and depending on the implementation, it can exist as part of the Heap. In a simple
implementation, it can be part of the Heap without undergoing GC or compression.

##### Run-Time Constant Pool

The **Run-Time Constant Pool is part of the Method Area** and contains symbolic references to class and interface names,
field names, and method names. The JVM uses the Run-Time Constant Pool to find the actual memory addresses for
references.

As seen when analyzing bytecode, the constant pool was found inside the class file. During runtime, the constant pool,
which was part of the class file structure, is read and loaded into memory by the class loader.

##### String Constant Pool

> Where the "Hello World" string is stored

As mentioned earlier, the Run-Time Constant Pool is part of the Method Area. However, there is also a Constant Pool in
the Heap, known as the String Constant Pool.

When creating a string using `new String("Hello World")`, the string is treated as an object and is managed in the Heap.
Let's look at an example:

```java
String s1 = "Hello World";
String s2 = new String("Hello World");
```

The string literal used inside the constructor is retrieved from the String Pool, but the `new` keyword guarantees the
creation of a new and unique string.

If we examine the bytecode, we can see that the string is 'created' using the `invokespecial` instruction.

The `invokespecial` instruction means that the object initialization method is directly called.

Why does the String Constant Pool exist in the Heap, unlike the Run-Time Constant Pool in the Method Area? 🤔

- Strings belong to very large objects. Also, it is difficult to predict how many strings will be created, so a process
  is needed to efficiently use memory space by cleaning up unused strings. This means that it is necessary for the
  String Constant Pool to exist in the Heap.
    - Storing in the stack would make it difficult to find space, and declaring a string could fail.
    - The stack size is typically around 320kb~1MB for 32-bit and 1MB~2MB for 64-bit systems.
- Strings are managed as immutable. They cannot be modified and are always created anew. By reusing already created
  strings, memory space is saved (interning). However, unused (unreachable) strings may accumulate over the
  application's lifecycle. To efficiently utilize memory, there is a need to clean up unreferenced strings, which again
  leads to the need for **GC**.

In conclusion, the String Constant Pool needs to exist in the Heap to be under the influence of GC.

String comparison operations require N operations for perfect matching if the length is N. In contrast, using the pool,
the equals comparison only requires checking the reference, incurring a cost of $O(1)$.

It is possible to move a string that is outside the String Constant Pool into the String Constant Pool by creating a
string using `new`.

```java
String greeting = new String("Hello World");
greeting.intern(); // using the constant pool

// Now, comparison with the string literal in the SCP is possible.
assertThat(greeting).isEqualTo("Hello World"); // true
```

While this was provided as a trick in the past to save memory, it is no longer necessary, so it is best to **use strings
as literals**.

To summarize:

1. Numbers have a maximum value, whereas strings, due to their nature, have an unclear maximum size.
2. Strings can become very large and are likely to be used frequently after creation compared to other types.
3. Naturally, high memory efficiency is required. To achieve this while increasing usability, they should be globally
   referable.
4. If placed in the Per-Thread Data Area within the Stack, they cannot be reused by other threads, and if the size is
   large, finding allocation space becomes difficult.
5. It is rational to have them in the Shared Data Area + in the Heap, but since they need to be treated as immutable at
   the JVM level, a dedicated Constant Pool is created within the Heap to manage them separately.

:::tip

While string literals inside constructors are retrieved from the String Constant Pool, the `new` keyword guarantees
independent string creation. Consequently, there are two strings, one in the String Constant Pool and one in the Heap.

:::

#### Per-thread Data Areas

In addition to the Shared Data Area, the JVM manages data for individual threads separately. **The JVM actually supports
the concurrent execution of quite a few threads**.

##### PC Register

Each JVM thread has a PC (program counter) register.

The PC register stores the current position of the execution of instructions to enable the CPU to continue executing
instructions. It also holds the memory address of the next instruction to be executed, aiding in optimizing instruction
execution.

The behavior of the PC depends on the nature of the method:

- For non-native methods, the PC register stores the address of the currently executing instruction.
- For native methods, the PC register holds an undefined value.

The lifecycle of the PC register is essentially the same as the thread's lifecycle.

##### JVM Stack

Each JVM thread has its own independent stack. The JVM stack is a data structure that stores method invocation
information. A new frame is created on the stack for each method invocation, containing the method's local variables and
the address of the return value. If it is a primitive type, it is stored directly on the stack, while if it is a wrapper
type, it holds a reference to an instance created in the Heap. This results in int and double types having a slight
performance advantage over Integer and Double.

Thanks to the JVM stack, the JVM can trace program execution and record stack traces as needed.

- This is known as a stack trace. `printStackTrace` is an example of this.
- In scenarios like webflux's event loop where a single operation traverses multiple threads, the significance of a
  stack trace may be difficult to understand.

The memory size and allocation method of the stack can be determined by the JVM implementation. Typically, around 1MB of
space is allocated when a thread starts.

JVM memory allocation errors can result in a stack overflow error. However, if a JVM implementation allows dynamic
expansion of the JVM stack size and a memory error occurs during expansion, the JVM may throw an OutOfMemory error.

##### Native Method Stack

Native methods are methods written in languages other than Java. These methods cannot be compiled into bytecode (as they
are not Java, javac cannot be used), so they require a separate memory area.

- The Native Method Stack is very similar to the JVM Stack but is exclusively for native methods.
- The purpose of the Native Method Stack is to track the execution of native methods.

JVM implementations can determine how to manipulate the size and memory blocks of the Native Method Stack.

In the case of memory allocation errors originating from the Native Method Stack, a stack overflow error occurs.
However, if an attempt to increase the size of the Native Method Stack fails, an OutOfMemory error occurs.

In conclusion, a JVM implementation can decide not to support Native Method calls, emphasizing that such an
implementation does not require a Native Method Stack.

_The usage of the Java Native Interface will be covered in a separate article._

### Execution Engine

Once the loading and storage stages are complete, the JVM executes the Class File. It consists of three elements:

- Interpreter
- JIT Compiler
- Garbage Collector

#### Interpreter

When a program starts, the Interpreter reads the bytecode line by line, converting it into machine code that the machine
can understand.

Interpreters are generally slower. Why is that?

Compiled languages can define resources and types needed for a program to run during the compilation process before
execution. However, in interpreted languages, necessary resources and variable types cannot be known until execution,
making optimization difficult.

#### JIT Compiler

The Just In Time Compiler was introduced in Java 1.1 to overcome the shortcomings of the Interpreter.

The JIT compiler compiles bytecode into machine code at runtime, improving the execution speed of Java applications. It
detects frequently executed parts (hot code) and compiles them.

You can use the following keywords to check JIT-related behaviors if needed:

- `-XX:+PrintCompilation`: Outputs JIT-related logs
- `-Djava.compiler=NONE`: Deactivates JIT. You can observe a performance drop.

#### Garbage Collector

The Garbage Collector is a critical component that deserves a separate document, and there is already
a [document](https://songkg7.github.io/posts/Garbage-Collection/) on it, so it will be skipped this time.

- Optimizing the GC is not common.
    - However, there are cases where a delay of over 500ms due to GC operations occurs, and in scenarios handling high
      traffic or tight TTLs in caches, a 500ms delay can be a significant issue.

## Conclusion

Java is undoubtedly a complex language.

In interviews, you often get asked questions like this:

_How well do you think you know Java?_

Now, you should be able to answer more confidently.

_Um... 🤔 Just about Hello World._

## Reference

- [inpa blog](https://inpa.tistory.com/entry/JAVA-%E2%98%95-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%8A%94-%EC%96%B8%EC%A0%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC%EC%97%90-%EB%A1%9C%EB%94%A9-%EC%B4%88%EA%B8%B0%ED%99%94-%EB%90%98%EB%8A%94%EA%B0%80-%E2%9D%93#jvm%EC%9D%98_%ED%81%B4%EB%9E%98%EC%8A%A4_%EB%A1%9C%EB%8D%94_class_loader)
- https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-2.html#jvms-2.5
- https://www.baeldung.com/java-jvm-run-time-data-areas
- https://sgcomputer.tistory.com/64
- https://johngrib.github.io/wiki/java/run-time-constant-pool/
- https://johngrib.github.io/wiki/jvm-stack/
- https://code-run.tistory.com/8
