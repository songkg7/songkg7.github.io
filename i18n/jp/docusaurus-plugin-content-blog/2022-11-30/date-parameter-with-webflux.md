---
title: "WebFluxでURLパラメータとしてDate型を使用する方法"
date: 2022-11-22 11:28:00 +0900
aliases:
tags: [webflux, localdatetime, url, parameter]
categories: Java
authors: haril
description: "WebFluxでURLパラメータとしてDate型を使用する際の考慮点を探る"
---

## 概要

`LocalDateTime`のような時間形式をURLパラメータとして使用する場合、デフォルトの形式と一致しないと、以下のようなエラーメッセージが表示されることがあります。

```console
Exception: Failed to convert value of type 'java.lang.String' to required type 'java.time.LocalDateTime';
```

特定の形式に変換を許可するためには、どのような設定が必要でしょうか？この記事では、その変換方法を探ります。

## 内容

まず、簡単なサンプルを作成してみましょう。

```java
public record Event(
        String name,
        LocalDateTime time
) {
}
```

これは、イベントの名前と発生時間を含むシンプルなオブジェクトで、`record`を使用して作成されています。

```java
@RestController
public class EventController {

    @GetMapping("/event")
    public Mono<Event> helloEvent(Event event) {
        return Mono.just(event);
    }

}
```

ハンドラーは従来のコントローラーモデルを使用して作成されています。

:::tip

Spring WebFluxでは、ルータ関数を使用してリクエストを管理できますが、この記事では`@RestController`を使用することに焦点を当てています。

:::

テストコードを書いてみましょう。

```java
@WebFluxTest
class EventControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void helloEvent() {
        webTestClient.get().uri("/event?name=Spring&time=2021-08-01T12:00:00")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.name").isEqualTo("Spring")
                .jsonPath("$.time").isEqualTo("2021-08-01T12:00:00");
    }

}
```

![image1](./1.webp)

テストコードを実行すると、以下のリクエストがシミュレートされます。

```bash
$ http localhost:8080/event Accept=application/stream+json name==Spring time==2021-08-01T12:00
HTTP/1.1 200 OK
Content-Length: 44
Content-Type: application/stream+json

{
    "name": "Spring",
    "time": "2021-08-01T12:00:00"
}
```

リクエストがデフォルトの形式で行われると、正常なレスポンスが返されます。しかし、リクエスト形式が変更された場合はどうでしょうか？

![image2](./2.webp)

![image3](./3.webp)

```bash
$ http localhost:8080/event Accept=application/stream+json name==Spring time==2021-08-01T12:00:00Z
HTTP/1.1 500 Internal Server Error
Content-Length: 131
Content-Type: application/stream+json

{
    "error": "Internal Server Error",
    "path": "/event",
    "requestId": "ecc1792e-3",
    "status": 500,
    "timestamp": "2022-11-28T10:04:52.784+00:00"
}
```

上記のように、特定の形式でレスポンスを受け取るためには追加の設定が必要です。

### 1. `@DateTimeFormat`

最も簡単な解決策は、変換したいフィールドにアノテーションを追加することです。変換したい形式を定義することで、希望の形式でリクエストを行うことができます。

```java
public record Event(
        String name,

        @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
        LocalDateTime time
) {
}
 ```

再度テストを実行すると、正常に通過することが確認できます。

:::info

リクエスト形式を変更しても、レスポンス形式は変更されません。レスポンス形式の変更は`@JsonFormat`などのアノテーションを使用して設定できますが、この記事では取り上げません。

:::

これは簡単な解決策ですが、必ずしも最良の方法ではありません。変換が必要なフィールドが多い場合、手動でアノテーションを追加するのは非常に面倒で、アノテーションをうっかり忘れるとバグの原因になります。`ArchUnit`[^fn_nth_2]のようなテストライブラリを使用してチェックすることも可能ですが、コードの理解に必要な労力が増えます。

### 2. `WebFluxConfigurer`

`WebFluxConfigurer`を実装し、フォーマッタを登録することで、各`LocalDateTime`フィールドにアノテーションを追加する必要がなくなります。

`Event`から`@DateTimeFormat`を削除し、以下のように設定を行います。

```java
@Configuration
public class WebFluxConfig implements WebFluxConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        DateTimeFormatterRegistrar registrar = new DateTimeFormatterRegistrar();
        registrar.setUseIsoFormat(true);
        registrar.registerFormatters(registry);
    }
}
```

:::danger

`@EnableWebFlux`を使用すると、マッパーが上書きされ、アプリケーションが意図した通りに動作しなくなる可能性があります。[^footnote]

:::

再度テストを実行すると、アノテーションなしで正常に通過することが確認できます。

![image4](./4.webp)

### 特定のフィールドに異なる形式を適用する

これは簡単です。フィールドに直接`@DateTimeFormat`を追加する方法が優先されるため、希望するフィールドに`@DateTimeFormat`を追加することができます。

```java
public record Event(
        String name,

        LocalDateTime time,

        @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH")
        LocalDateTime anotherTime
) {
}
```

```java
    @Test
    void helloEvent() {
        webTestClient.get().uri("/event?name=Spring&time=2021-08-01T12:00:00Z&anotherTime=2021-08-01T12")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.name").isEqualTo("Spring")
                .jsonPath("$.time").isEqualTo("2021-08-01T12:00:00")
                .jsonPath("$.anotherTime").isEqualTo("2021-08-01T12:00:00");
    }
```

![image5](./5.webp)

:::tip

URIが長くなる場合、`UriComponentsBuilder`を使用するのが良いアプローチです。

```java
String uri = UriComponentsBuilder.fromUriString("/event")
        .queryParam("name", "Spring")
        .queryParam("time", "2021-08-01T12:00:00Z")
        .queryParam("anotherTime", "2021-08-01T12")
        .build()
        .toUriString();
```

:::

## 結論

`WebFluxConfigurer`を使用することで、グローバルに一貫した形式を適用できます。異なるクラスにまたがる複数のフィールドが特定の形式を必要とする場合、`WebFluxConfigurer`を使用する方が、各フィールドに`@DateTimeFormat`を適用するよりもはるかに簡単です。状況に応じて適切な方法を選択してください。

- `@DateTimeFormat`: 適用が簡単。グローバル設定よりも優先され、特定のフィールドに異なる形式を適用できます。
- `WebFluxConfigurer`: 適用が比較的複雑ですが、一貫した設定が必要な大規模プロジェクトに有利です。`@DateTimeFormat`と比較して、アノテーションの追加忘れなどの人的エラーを防ぐことができます。

:::info

すべてのサンプルコードは[GitHub](https://github.com/songkg7/java-practice/blob/main/spring-webflux-parameter-sample/src/test/java/com/example/springwebfluxparametersample/controller/EventControllerTest.java)で確認できます。

:::

## 参考

[^footnote]: [LocalDateTime is representing in array format](https://stackoverflow.com/questions/63682619/localdatetime-is-representing-in-array-format)

[^fn_nth_2]: [ArchUnit](https://www.archunit.org)