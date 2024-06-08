---
title: "テスト実行の高速化、Springコンテキストのモッキング"
date: 2023-01-25 11:33:00 +0900
aliases: 
tags: [テスト, spring, mockito, junit, java, mock]
categories: Spring
authors: haril
description: "Spring環境でのコンテキスト読み込みを排除することでテスト実行を高速化する方法を共有します。"
---

## 概要

プロジェクトごとにテストコードを書くことは一般的になっています。プロジェクトが成長するにつれて、テストの数も増え、全体のテスト実行時間が長くなります。特にSpringフレームワークに基づいたプロジェクトでは、Spring Beanコンテキストの読み込みによってテスト実行が大幅に遅くなることがあります。この記事では、この問題に対処する方法を紹介します。

## すべてのテストをユニットテストとして書く

テストは速くなければなりません。テストが速ければ速いほど、頻繁に実行することに躊躇しなくなります。すべてのテストを一度に実行するのに10分かかる場合、フィードバックは10分後にしか得られません。

Springでテストを高速化するためには、`@SpringBootTest`を使用しないことが重要です。すべてのBeanを読み込むと、必要なBeanを読み込む時間が圧倒的に長くなり、ビジネスロジックをテストするコードの実行時間よりも長くなります。

```java
@SpringBootTest
class SpringApplicationTest {

    @Test
    void main() {
    }
}
```

上記のコードは、Springアプリケーションを実行するための基本的なテストコードです。`@SpringBootTest`によって構成されたすべてのBeanが読み込まれます。では、テストに必要なBeanだけをどのように注入するのでしょうか？

## アノテーションやMockitoの活用

特定のアノテーションを使用することで、関連するテストに必要なBeanだけが自動的に読み込まれます。これにより、コンテキスト読み込みを通じてすべてのBeanを読み込むのではなく、本当に必要なBeanだけを読み込むことで、テスト実行時間を最小限に抑えることができます。

いくつかのアノテーションを簡単に見てみましょう。

- `@WebMvcTest`: Web MVC関連のBeanのみを読み込みます。
- `@WebFluxTest`: Web Flux関連のBeanのみを読み込みます。`WebTestClient`を使用できます。
- `@DataJpaTest`: JPAリポジトリ関連のBeanのみを読み込みます。
- `@WithMockUser`: Spring Securityを使用する場合、偽のユーザーを作成し、不要な認証プロセスをスキップします。

さらに、Mockitoを使用することで、複雑な依存関係を簡単に解決してテストを書くことができます。これらの2つの概念を適切に活用することで、ほとんどのユニットテストはそれほど難しくありません。

:::warning

過度なモッキングが必要な場合、依存関係の設計に問題がある可能性が高いです。モッキングの多用には注意が必要です。

:::

## SpringApplicationはどうする？

SpringApplicationを実行するには、`SpringApplication.run()`を実行する必要があります。このメソッドの実行を確認するためにすべてのSpringコンテキストを非効率的に読み込むのではなく、コンテキスト読み込みが発生する`SpringApplication`をモックし、`run()`が呼び出されるかどうかだけを確認することができます。

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

## 結論

ロバート・C・マーティンの『Clean Code』の第9章では「FIRST原則」について議論しています。

この記事で述べたように、最初の文字FはFast（速い）を意味します。テストの速さの重要性を再度強調し、次の引用で締めくくります。

> テストは十分に速くなければならない。 - ロバート・C・マーティン

## 参考

- [Toss](https://www.youtube.com/watch?v=jdlBu2vFv58)