---
title: "Fixture Monkeyでテストを簡単かつ便利に"
date: 2024-02-03 23:37:25 +0900
aliases: null
tags: [testing, test, fixture, naver, opensource]
image: img/banner/fixture-monkey-banner.png
authors: haril
description: "Fixture Monkeyは、Naverがオープンソースとして開発しているテストオブジェクト生成ライブラリです。テストフィクスチャをランダムに生成することで、カオスエンジニアリングを実践的に体験できます。"
---

> "Write once, Test anywhere"

Fixture Monkeyは、Naverがオープンソースとして開発しているテストオブジェクト生成ライブラリです。この名前は、Netflixのオープンソースツールである[Chaos Monkey](https://netflix.github.io/chaosmonkey/)にインスパイアされたようです。テストフィクスチャをランダムに生成することで、カオスエンジニアリングを実践的に体験できます。

約2年前に初めて出会って以来、私のお気に入りのオープンソースライブラリの一つとなりました。これまでに2つの記事も書きました。

- [Fixture Monkey オブジェクト生成戦略](https://songkg7.github.io/posts/Fixture-monkey-overview/)
- [Fixture Monkey 0.4.x](https://songkg7.github.io/posts/labmonkey/)

バージョンアップごとに変更が多く、追加の記事は書いていませんでしたが、バージョン1.xがリリースされた今、新たな視点で再訪することにしました。

以前の記事はJavaをベースにしていましたが、今回は現在のトレンドに合わせてKotlinで書いています。この記事の内容は公式ドキュメントに基づいており、実際の使用経験から得た洞察も加えています。

## Fixture Monkeyが必要な理由

従来のアプローチでどのような問題があるか、以下のコードを見てみましょう。

:::info

例ではJava開発者に馴染みのあるJUnit5を使用しましたが、個人的にはKotlin環境では[Kotest](https://kotest.io/)をお勧めします。

:::

```kotlin
data class Product (
    val id: Long,

    val productName: String,

    val price: Long,

    val options: List<String>,

    val createdAt: Instant,

    val productType: ProductType,

    val merchantInfo: Map<Int, String>
)

enum class ProductType {
    ELECTRONICS,
    CLOTHING,
    FOOD
}
```

```kotlin
@Test
fun basic() {
    val actual: Product = Product(
        id = 1L,
        price = 1000L,
        productName = "productName",
        productType = ProductType.FOOD,
        options = listOf(
            "option1",
            "option2"
        ),
        createdAt = Instant.now(),
        merchantInfo = mapOf(
            1 to "merchant1",
            2 to "merchant2"
        )
    )

    // テスト目的に比べて準備プロセスが長い
    actual shouldNotBe null
}
```

### テストオブジェクト生成の課題

テストコードを見ると、アサーションのためにオブジェクトを生成するだけで多くのコードを書かなければならないと感じます。実装の性質上、プロパティが設定されていないとコンパイルエラーが発生するため、意味のないプロパティでも書かなければなりません。

テストコードでアサーションのための準備が長くなると、コード内のテスト目的の意味が不明瞭になることがあります。このコードを初めて読む人は、意味のないプロパティにも隠れた意味があるかどうかを確認する必要があり、このプロセスは開発者の疲労を増加させます。

### エッジケースの認識の難しさ

プロパティを直接設定してオブジェクトを生成する場合、さまざまなシナリオで発生する可能性のある多くのエッジケースが見落とされがちです。

```kotlin
val actual: Product = Product(
    id = 1L, // idが負の値になったらどうなる？
    // ...省略
)
```

エッジケースを見つけるためには、開発者はプロパティを一つ一つ設定して確認する必要がありますが、実際にはランタイムエラーが発生して初めてエッジケースに気づくことが多いです。エラーが発生する前にエッジケースを簡単に発見するためには、オブジェクトのプロパティをある程度ランダムに設定する必要があります。

### オブジェクトマザーパターンの問題

テストオブジェクトを再利用するために、オブジェクトマザーパターンと呼ばれるパターンでは、オブジェクトを生成するファクトリークラスを作成し、そのクラスから生成されたオブジェクトを使用してテストコードを実行します。

しかし、この方法はテストコードだけでなくファクトリーの管理も継続的に必要であり、エッジケースの発見には役立ちません。

## Fixture Monkeyの使用

Fixture Monkeyは、上記の再利用性とランダム性の問題をエレガントに解決します。どのようにこれらの問題を解決するか見てみましょう。

まず、依存関係を追加します。

```kotlin
testImplementation("com.navercorp.fixturemonkey:fixture-monkey-starter-kotlin:1.0.13")
```

Kotlin環境でFixture Monkeyがスムーズに動作するようにするために`KotlinPlugin()`を適用します。

```kotlin
@Test
fun test() {
    val fixtureMonkey = FixtureMonkey.builder()
        .plugin(KotlinPlugin())
        .build()
}
```

先ほど使用した`Product`クラスを使って再度テストを書いてみましょう。

```kotlin
data class Product (
    val id: Long,

    val productName: String,

    val price: Long,

    val options: List<String>,

    val createdAt: Instant,

    val productType: ProductType,

    val merchantInfo: Map<Int, String>
)

enum class ProductType {
    ELECTRONICS,
    CLOTHING,
    FOOD
}
```

```kotlin
@Test
fun test() {
    val fixtureMonkey = FixtureMonkey.builder()
        .plugin(KotlinPlugin())
        .build()

    val actual: Product = fixtureMonkey.giveMeOne()

    actual shouldNotBe null
}
```

不要なプロパティ設定なしに`Product`のインスタンスを作成できます。すべてのプロパティ値はデフォルトでランダムに埋められます。

![image](https://i.imgur.com/OxgNxNx.png)
_複数のプロパティがうまく埋められる_

### ポストコンディション

しかし、ほとんどの場合、**特定のプロパティ値が必要**です。例えば、例では`id`が負の数として生成されましたが、実際には`id`は正の数として使用されることが多いです。次のようなバリデーションロジックがあるかもしれません：

```kotlin
init {
    require(id > 0) { "idは正の数である必要があります" }
}
```

テストを数回実行した後、`id`が負の数として生成されるとテストが失敗します。すべての値がランダムに生成されるため、**予期しないエッジケース**を見つけるのに特に役立ちます。

![image](https://i.imgur.com/ZdFuJtM.png)

ランダム性を維持しつつ、バリデーションロジックが通るように範囲を少し制限しましょう。

```kotlin
@RepeatedTest(10)
fun postCondition() {
    val fixtureMonkey = FixtureMonkey.builder()
        .plugin(KotlinPlugin())
        .build()

    val actual = fixtureMonkey.giveMeBuilder<Product>()
        .setPostCondition { it.id > 0 } // 生成されたオブジェクトのプロパティ条件を指定
        .sample()

    actual.id shouldBeGreaterThan 0
}
```

テストを10回実行するために`@RepeatedTest`を使用しました。

![image](https://i.imgur.com/9NCTgr5.png)

すべてのテストが通ることがわかります。

### 様々なプロパティの設定

`postCondition`を使用する際は、条件を狭めすぎるとオブジェクト生成がコスト高になることに注意してください。これは、条件を満たすオブジェクトが生成されるまで内部で生成が繰り返されるためです。このような場合、特定の値を固定するために`setExp`を使用する方がはるかに良いです。

```kotlin
val actual = fixtureMonkey.giveMeBuilder<Product>()
    .setExp(Product::id, 1L) // 指定された値のみ固定され、他はランダム
    .sample()

actual.id shouldBe 1L
```

プロパティがコレクションの場合、`sizeExp`を使用してコレクションのサイズを指定できます。

```kotlin
val actual = fixtureMonkey.giveMeBuilder<Product>()
    .sizeExp(Product::options, 3)
    .sample()

actual.options.size shouldBe 3
```

`maxSize`と`minSize`を使用すると、コレクションの最大サイズと最小サイズの制約を簡単に設定できます。

```kotlin
val actual = fixtureMonkey.giveMeBuilder<Product>()
    .maxSizeExp(Product::options, 10)
    .sample()

actual.options.size shouldBeLessThan 11
```

他にも様々なプロパティ設定方法があるので、必要に応じて探索してみてください。

## 結論

Fixture Monkeyは、ユニットテストを書く際の不便さを本当に解消してくれます。この記事では触れませんでしたが、ビルダーに条件を作成して再利用したり、プロパティにランダム性を追加したり、開発者が見逃しがちなエッジケースを発見するのに役立ちます。その結果、テストコードが非常に簡潔になり、Object Motherのような追加コードが不要になり、メンテナンスが容易になります。

Fixture Monkey 1.xのリリース前でも、テストコードを書くのに非常に役立ちました。今や安定版となったので、ぜひ導入してテストコードを書く楽しさを味わってください。

## 参考

- [Fixture Monkey](https://github.com/naver/fixture-monkey)