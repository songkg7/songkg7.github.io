---
title: "Speeding up Test Execution, Spring Context Mocking"
date: 2023-01-25 11:33:00 +0900
aliases: 
tags: [test, spring, mockito, junit, java, mock]
categories: Spring
authors: haril
description: "Sharing methods to speed up test execution by eliminating Context loading in a Spring environment."
---

## Overview

Writing test code in every project has become a common practice. As projects grow, the number of tests inevitably increases, leading to longer overall test execution times. Particularly in projects based on the Spring framework, test execution can significantly slow down due to the loading of Spring Bean contexts. This article introduces methods to address this issue.

## Write All Tests as Unit Tests

Tests need to be fast. The faster they are, the more frequently they can be run without hesitation. If running all tests once takes 10 minutes, it means feedback will only come after 10 minutes.

To achieve faster tests in Spring, it is essential to avoid using `@SpringBootTest`. Loading all Beans causes the time to load necessary Beans to be overwhelmingly longer than executing the code for testing business logic.

```java
@SpringBootTest
class SpringApplicationTest {

    @Test
    void main() {
    }
}
```

The above code is a basic test code for running a Spring application. All Beans configured by `@SpringBootTest` are loaded. How can we inject only the necessary Beans for testing?

## Utilizing Annotations or Mockito

By using specific annotations, only the necessary Beans for related tests are automatically loaded. This way, instead of loading all Beans through Context loading, only the truly needed Beans are loaded, minimizing test execution time.

Let's briefly look at a few annotations.

- `@WebMvcTest`: Loads only Web MVC related Beans.
- `@WebFluxTest`: Loads only Web Flux related Beans. Allows the use of `WebTestClient`.
- `@DataJpaTest`: Loads only JPA repository related Beans.
- `@WithMockUser`: When using Spring Security, creates a fake User, skipping unnecessary authentication processes.

Additionally, by using Mockito, complex dependencies can be easily resolved to write tests. By appropriately utilizing these two concepts, most unit tests are not overly difficult.

:::warning

If excessive mocking is required, there is a high possibility that the dependency design is flawed. Be cautious not to overuse mocking.

:::

## What about SpringApplication?

For SpringApplication to run, `SpringApplication.run()` must be executed. Instead of inefficiently loading all Spring contexts to verify the execution of this method, we can mock the `SpringApplication` where context loading occurs and verify only if `run()` is called without using `@SpringBootTest`.

```java
class DemoApplicationTests {  
  
    @Test  
    void main() {  
        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {  
            when(SpringApplication.run(DemoApplication.class)).thenReturn(null);  
  
            DemoApplication.main(new String[]{});  
  
            springApplication.verify(  
                    () -> SpringApplication.run(DemoApplication.class), only()  
            ); 
        }
    }
}
```

## Conclusion

In Robert C. Martin's Clean Code, Chapter 9 discusses the 'FIRST principle'.

Reflecting on the first letter, F, for Fast, as mentioned in this article, we briefly introduced considerations on speed. Once again, emphasizing the importance of fast tests, we conclude with the quote:

> Tests must be fast enough. - Robert C. Martin

## Reference

- [Toss](https://www.youtube.com/watch?v=jdlBu2vFv58)