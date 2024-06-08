---
title: "JavaからHello Worldお出力するまで 1"
date: 2023-12-10 12:45:33 +0900
aliases: null
tags: [ java, compile, jvm ]
categories: [ Java ]
authors: haril
image: img/banner/hello-world-programmer.webp
description: "プログラミングの世界では、常に「Hello World」という文を出力することから始まります。それはまるで不文律のようです。このシリーズでは、「Hello World」を出発点とする理由、コンパイルされたクラスファイル、そしてコンピュータがJavaコードを解釈し実行する方法について詳しく探ります。"
---

![banner](./hello-world-programmer.webp)

プログラミングの世界では、常に「Hello World」という文を出力することから始まります。それはまるで不文律のようです。

```python
# hello.py
print("Hello World")
```

```bash
python hello.py
// Hello World
```

Python？素晴らしい。

```js
// hello.js
console.log("Hello World");
```

```bash
node hello.js
// Hello World
```

JavaScript？悪くない。

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

しかし、Javaはまるで別の世界から来たように感じます。クラス名がファイル名と一致しなければならないことさえまだ触れていません。

`public`とは何か、`class`とは何か、`static`とは何か、`void`、`main`、`String[]`、そして`System.out.println`を経て、ようやく文字列「Hello World」にたどり着きます。~~さあ、別の言語を学びましょう。~~[^fn-nth-1]

単に「Hello World」を出力するだけでも、Javaはかなりの背景知識を要求します。なぜJavaはこんなにも冗長なプロセスを必要とするのでしょうか？

このシリーズは3つの章に分かれています。目標は、2つの単語「Hello World」を出力するために裏で何が起こっているのかを詳しく探ることです。各章の具体的な内容は以下の通りです：

- 第1章では、**Hello Worldを出発点とする理由**を紹介します。
- 第2章では、**コンパイルされたクラスファイルとコンピュータがJavaコードを解釈し実行する方法**を検討します。
- 最後に、JVMが`public static void main`をロードして実行する方法とその**動作原理**を探ります。

3つの章の内容を組み合わせることで、ようやく「Hello World」の概念を理解することができます。かなり長い旅ですが、深呼吸して始めましょう。

## 第1章. なぜ？

JavaでHello Worldを出力する前に、いくつかの「なぜ」の瞬間を考慮する必要があります。

### なぜクラス名はファイル名と一致しなければならないのか？

より正確には、`public`クラスの名前がファイル名と一致しなければならないのです。なぜでしょうか？

Javaプログラムはコンピュータに直接理解されるものではありません。JVMという仮想マシンがプログラムの実行を助けます。Javaプログラムをコンピュータで実行可能にするためには、いくつかのステップを経てJVMが解釈できる機械語に変換する必要があります。最初のステップは、コンパイラを使用してプログラムをJVMが解釈できるバイトコードに変換することです。変換されたバイトコードはJVM内部のインタープリタを通じて機械語に翻訳され、実行されます。

コンパイルプロセスを簡単に見てみましょう。

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

Javaは**コンパイル時に各クラスごとに`.class`ファイルを生成します**。

さて、JVMはプログラムを実行するために`main`メソッドを見つける必要があります。どうやって`main`メソッドを見つけるのでしょうか？

_なぜ`main()`を見つける必要があるのか？もう少し待ってください。_

もしJavaファイル名がパブリッククラス名と一致しない場合、Javaインタープリタは`main`メソッドを見つけるためにすべてのクラスファイルを読み込む必要があります。ファイル名がパブリッククラス名と一致している場合、Javaインタープリタは解釈する必要のあるファイルをよりよく特定できます。

1000クラスが含まれる`Java1000`というファイルを想像してみてください。1000クラスの中から`main()`がどこにあるのかを特定するために、インタープリタはすべてのクラスファイルを調べる必要があります。

しかし、ファイル名がパブリッククラス名と一致している場合、`main()`により迅速にアクセスでき（`main`はパブリッククラスに存在するため）、すべてのロジックが`main()`から始まるため、他のクラスにも簡単にアクセスできます。

### なぜpublicでなければならないのか？

JVMはクラス内の`main`メソッドを見つける必要があります。クラスの外部からクラスにアクセスするJVMがクラス内のメソッドを見つけるためには、そのメソッドが`public`でなければなりません。実際、アクセス修飾子を`private`に変更すると、`main`を`public`として宣言するように指示するエラーメッセージが表示されます。

```text
Error: Main method not found in class VerboseLanguage, please define the main method as:
   public static void main(String[] args)
```

### なぜstaticでなければならないのか？

JVMは`public main()`メソッドを見つけました。しかし、このメソッドを呼び出すためには、まずオブジェクトを作成する必要があります。JVMはこのオブジェクトを必要とするのでしょうか？いいえ、JVMはただ`main`を呼び出すだけでよいのです。`static`として宣言することで、JVMは不要なオブジェクトを作成する必要がなくなり、メモリを節約できます。

### なぜvoidでなければならないのか？

`main`メソッドの終了はJavaの実行の終了を意味します。JVMは`main`の戻り値を使用することができないため、戻り値の存在は意味がありません。したがって、`void`として宣言するのが自然です。

### なぜmainという名前でなければならないのか？

`main`というメソッド名は、JVMが**アプリケーションの実行エントリーポイントを見つけるために設計されたもの**です。

「設計」という言葉は大げさに聞こえますが、実際には`main`という名前のメソッドを見つけるようにハードコーディングされています。もし見つける名前が`main`ではなく`haril`だった場合、`haril`という名前のメソッドを探していたでしょう。もちろん、Javaの作成者たちは`main`を選んだ理由があったのでしょうが、それがすべてです。

```c
mainClassName = GetMainClassName(env, jarfile);
mainClass = LoadClass(env, classname);

// Find the main method
mainID = (*env)->GetStaticMethodID(env, mainClass, "main", "([Ljava/lang/String;)V");

jbject obj = (*env)->ToReflectedMethod(env, mainClass, mainID, JNI_TRUE);
```

### なぜargsが必要なのか？

これまで、`main()`の`String[] args`については触れていませんでした。なぜこの引数が必要で、なぜ省略するとエラーが発生するのでしょうか？

`public static void main(String[] args)`はJavaアプリケーションのエントリーポイントであるため、この引数はJavaアプリケーションの外部から渡される必要があります。

> 標準入力のすべての型は文字列として入力されます。

これが`args`が文字列配列として宣言される理由です。考えてみれば納得です。Javaアプリケーションが実行される前に、カスタムオブジェクトタイプを直接作成できますか？🤔

では、なぜ`args`が必要なのでしょうか？

外部から内部に引数を簡単に渡すことで、Javaアプリケーションの動作を変更することができます。このメカニズムは、Cプログラミングの初期からプログラムの動作を制御するために広く使用されてきました。特にシンプルなアプリケーションにとって、この方法は非常に効果的です。**Javaはこの広く使用されている方法を採用しただけです**。

`String[] args`を省略できない理由は、Javaがエントリーポイントとして`public static void main(String[] args)`のみを許可しているためです。Javaの作成者たちは、`args`を宣言して使用しない方が、省略を許可するよりも混乱が少ないと考えたのです。

### System.out.println

最後に、出力に関連するメソッドについて話し始めることができます。

_もう一度言いますが、Pythonでは`print("Hello World")`でした。[^fn-nth-2]_

Javaプログラムはオペレーティングシステム上で直接実行されるのではなく、JVMという仮想マシン上で実行されます。これにより、Javaプログラムはオペレーティングシステムに関係なくどこでも実行できるようになりますが、オペレーティングシステムが提供する特定の機能を使用するのが難しくなります。これが、JavaでCLIを作成したり、OSのメトリクスを収集したりするのが難しい理由です。

しかし、限られたOS機能を活用する方法（JNI）があり、`System`はこの機能を提供します。主な機能のいくつかは次のとおりです：

- 標準入力
- **標準出力**
- 環境変数の設定
- 実行中のアプリケーションを終了し、ステータスコードを返す

`Hello World`を出力するために、`System`の標準出力機能を使用しています。

実際、`System.out.println`の流れを追うと、`native`キーワードが付いた`writeBytes`メソッドに出会い、この操作をCコードに委譲し、標準出力に転送することがわかります。

```java
// FileOutputStream.java
private native void writeBytes(byte b[], int off, int len, boolean append)
    throws IOException;
```

`native`キーワードが付いたメソッドの呼び出しは、Java Native Interface（JNI）を通じて動作します。これは後の章で取り上げます。

### String

Javaの文字列は少し特別です。いや、かなり特別なようです。文字列は別のメモリ空間に割り当てられ、特別に扱われていることがわかります。なぜでしょうか？

文字列の次の特性に注目することが重要です：

- 非常に大きくなる可能性がある。
- 比較的頻繁に再利用される。

したがって、文字列は一度作成されたら再利用することに重点を置いて設計されています。大きな文字列データがメモリ内でどのように管理されるかを完全に理解するには、後で取り上げるトピックの理解が必要です。ここでは、メモリ空間の節約の原則について簡単に触れておきます。

まず、Javaで文字列がどのように宣言されるかを見てみましょう。

```java
String greeting = "Hello World";
```

内部的には次のように動作します：

![](https://i.imgur.com/7j2HMrL.webp)

文字列はString Constant Poolに作成され、不変の特性を持っています。一度文字列が作成されると変更されず、新しい文字列を作成する際にConstant Poolに同じ文字列が見つかると、それが再利用されます。

_次の章では、JVMスタック、フレーム、ヒープについて取り上げます。_

もう一つの文字列の宣言方法はインスタンス化です。

```java
String greeting = new String("Hello World");
```

この方法は内部動作に違いがあるため、あまり使用されません。以下のように動作します。

![](https://i.imgur.com/pN25lbX.webp)

`new`キーワードを使用せずに文字列を直接使用すると、String Constant Poolに作成され、再利用されます。しかし、`new`キーワードでインスタンス化すると、Constant Poolには作成されません。これにより、同じ文字列が複数回作成され、メモリ空間が無駄になる可能性があります。

### まとめ

この章では、次の質問に答えました：

- なぜ`.java`ファイル名はクラス名と一致しなければならないのか？
- なぜ`public static void main(String[] args)`でなければならないのか？
- 出力操作の流れ
- 文字列の特性とその作成および使用の基本原則

次の章では、Javaコードを自分でコンパイルし、バイトコードがどのように生成されるか、そのメモリアリアとの関係などを探ります。

## 参考文献

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
