---
title: ゲッターとセッターに関する真実と誤解
date: 2022-06-23 10:22:00 +0900
tags: [java, getter, setter, oop, encapsulation]
categories: [Java]
authors: haril
---

Googleで「getter/setter」を検索すると、数多くの記事が見つかります。その多くは、カプセル化や情報隠蔽といったキーワードに焦点を当てて、`getter/setter`を使用する理由を説明しています。

一般的な説明では、フィールド変数を`private`として宣言し、外部からのアクセスを防ぎ、`getter/setter`を通じてのみ公開することでカプセル化が達成されるとされています。

しかし、`getter/setter`を使用することで本当にデータをカプセル化できるのでしょうか？

実際には、**`getter/setter`ではカプセル化を全く達成できません。** カプセル化を達成するためには、ゲッターとセッターの使用を避けるべきです。これを理解するためには、カプセル化の明確な理解が必要です。

## カプセル化とは？

> オブジェクト指向プログラミングにおけるカプセル化には、オブジェクトの属性（データフィールド）と動作（メソッド）を一緒にまとめることと、オブジェクトの実装の詳細を内部に隠すことの二つの側面があります。 - Wikipedia

**カプセル化とは、外部のエンティティがオブジェクトの内部属性を完全に知ることができないようにすることを意味します。**

## なぜゲッターとセッターはカプセル化を達成できないのか

学んだように、カプセル化は外部のエンティティがオブジェクトの内部属性を知ることができないようにすることを指します。しかし、`getter/setter`は特定のフィールドが存在することを外部に露呈しています。例を見てみましょう。

### 例

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
        return String.format("私の名前は%sで、年齢は%d歳です。", name, age);
    }
}
```

```java
class StudentTest {

    @Test
    void student() {
        Student student = new Student();
        student.setName("ジョン");
        student.setAge(20);
        String introduce = student.introduce();

        assertThat(student.getName()).isEqualTo("ジョン");
        assertThat(student.getAge()).isEqualTo(20);
        assertThat(introduce).isEqualTo("私の名前はジョンで、年齢は20歳です。");
    }
}
```

`Student`クラスの外部から、そのクラスには`name`と`age`という属性があることが明らかです。この状態をカプセル化されていると考えられるでしょうか？

もし`Student`から`age`属性を削除した場合、`getter/setter`を使用しているすべての場所で変更が必要になります。これにより強い結合が生じます。

真のカプセル化とは、オブジェクトの内部構造の変更が外部のエンティティに影響を与えないことを意味します。公開インターフェースを除いて。

内部実装を隠してみましょう。

```java
public class Student {

    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String introduce() {
        return String.format("私の名前は%sで、年齢は%d歳です。", name, age);
    }
}
```

```java
class StudentTest {

    @Test
    void student() {
        Student student = new Student("ジョン", 20);
        String introduce = student.introduce();

        assertThat(introduce).isEqualTo("私の名前はジョンで、年齢は20歳です。");
    }
}
```

このように、オブジェクトは公開インターフェースを通じて内部実装を露呈しません。どのようなデータを保持しているかを知ることができず、変更も防ぎ、メッセージを通じてのみ通信します。

## 結論

カプセル化はオブジェクト指向設計において重要なトピックであり、外部要因に依存しない設計を強調します。カプセル化のレベルについては意見が分かれ、`getter`と`setter`の両方を使用しないことを推奨する人もいれば、`getter`の使用は許容されるとする人もいます。

個人的には、可能な限り`getter`の使用を避けるべきだと考えていますが、特にテストにおいては、ゲッターやセッターがあるとテストコードの記述が容易になる場合があります。カプセル化のレベルを決定するには、現在の状況や開発中のコードの目的に依存します。

良い設計は常にトレードオフの過程を経て生まれます。

:::info

すべてのサンプルコードは[GitHub](https://github.com/songkg7/java-practice/blob/main/basic-syntax/src/main/java/basicsyntax/getterandsetter/Student.java)で確認できます。

:::