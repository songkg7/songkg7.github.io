---
title: AWS S3と自動化による環境変数の管理
date: 2024-03-16 17:56:45 +0900
aliases:
tags:
    - cli
    - bash
    - automation
    - s3
categories:
image: /img/banner/aws-banner.png
updated: 2024-03-16 18:05:53 +0900
authors: haril
---

## 状況

- コードベースが成長するにつれて、Springアプリケーションを実行するために必要な設定値の数が増加しています。
- ほとんどの状況はテストコードで検証されますが、ローカルで`bootRun`を使用してテストする必要がある場合もあります。

## 問題点

- 設定値を環境変数に分離して管理したい。
- `.env`ファイルは通常Gitで無視されるため、バージョン管理が難しく、断片化しやすい。
    - 複数のマシン間でファイルを同期する方法が必要です。

## 質問

- 開発者間の摩擦を最小限に抑え、簡単に適用できる便利な方法はありますか？
    - メンテナンスが容易な、馴染みのある方法が望ましいです。
- `.env`ファイルのバージョン管理は可能ですか？
- 学習曲線は低いですか？
    - 解決策が問題よりも複雑になる状況は避けたいです。
- 本番環境に直接適用できますか？

## 回答

### AWS S3

- AWS CLIを使用して`.env`ファイルを更新するのは便利です。
- `.env`ファイルのバージョン管理はスナップショットを通じて行えます。
- AWS S3は多くの開発者に馴染みがあり、学習曲線が低いです。
- AWS ECSの本番環境では、S3 ARNを使用してシステム変数を直接適用できます。

![](https://i.imgur.com/Gs01GRA.gif)

.

..

...

....

## それだけですか？

それだけだと、記事が少し退屈に見えるかもしれませんね？もちろん、まだいくつかの問題が残っています。

### どのバケットにあるのか？

S3を使用する際、ファイル構造の最適化やビジネス特有の分類のために多くのバケットが作成されることが一般的です。

```bash
aws s3 cp s3://something.service.com/enviroment/.env .env
```

もし`.env`ファイルが見つからない場合、上記のようにAWS CLIを使用してダウンロードする必要があります。事前に誰かがバケットを共有してくれない限り、環境変数ファイルを見つけるためにすべてのバケットを検索する必要があり、不便です。共有を避けるつもりでしたが、再度共有するために何かを受け取るのは少し面倒に感じるかもしれません。

![](https://i.imgur.com/zoRtk5z.png)
_バケットが多すぎる。envはどこにあるのか？_

S3内のバケットを探索して必要な`.env`ファイルを見つけてダウンロードするプロセスを自動化すると、非常に便利です。これはfzfやgumのようなツールを使用してスクリプトを書くことで実現できます。

### Spring Bootはシステム環境変数を必要とし、`.env`ではない...

一部の方はすでにお気づきかもしれませんが、Spring Bootはシステム環境変数を読み取ってYAMLファイルのプレースホルダーを埋めます。しかし、単に`.env`ファイルを使用するだけではシステム環境変数が適用されず、Spring Bootの初期化プロセス中に拾われません。

簡単にその仕組みを見てみましょう。

```bash
# .env
HELLO=WORLD
```

```yaml
# application.yml
something:
    hello: ${HELLO} # OSのHELLO環境変数から値を取得します。
```

```java
@Slf4j
@Component
public class HelloWorld {

    @Value("${something.hello}")
    private String hello;

    @PostConstruct
    public void init() {
        log.info("Hello: {}", hello);
    }
}
```

![](https://i.imgur.com/2xsaxSq.png)
_SystemEnvironmentPropertySource.java_

![](https://i.imgur.com/ht8Wkin.png)

`@Value`のプレースホルダーが解決されず、Beanの登録が失敗し、エラーが発生します。

![](https://i.imgur.com/5hiC2wG.gif)
_単に`.env`ファイルがあるだけでは、システム環境変数として登録されません。_

`.env`ファイルを適用するには、`export`コマンドを実行するか、IntelliJの実行構成に`.env`ファイルを登録する必要があります。しかし、`export`コマンドを使用してローカルマシンに多くの変数をグローバルに登録すると、上書きなどの意図しない動作が発生する可能性があるため、IntelliJのGUIを通じて個別に管理することをお勧めします。

![](https://i.imgur.com/qyTR7Vb.png)
_IntelliJはGUIを介して`.env`ファイルの設定をサポートしています。_

![](https://i.imgur.com/9Ef45h1.png)
_プレースホルダーが解決され、正しく適用されました。_

## 最終回答 - 本当の最終回答

ふう、問題の特定と範囲設定の長いプロセスが終わりました。もう一度ワークフローをまとめ、スクリプトを紹介しましょう。

1. 自動化スクリプトを使用して、S3から適切な`.env`ファイルを見つけてダウンロードします。
2. `.env`をシステム環境変数として設定します。

シェルスクリプトはシンプルでありながら、[gum](https://github.com/charmbracelet/gum)を使用してスタイリッシュに書かれています。

[フルコード](https://github.com/songkg7/automation-script)

```bash
#!/bin/bash

S3_BUCKET=$(aws s3 ls | awk '{print $3}' | gum filter --reverse --placeholder "Select...") # 1.

# デプロイ環境を選択
TARGET=$(gum choose --header "Select a environment" "Elastic Container Service" "EC2")
if [ "$TARGET" = "Elastic Container Service" ]; then
    TARGET="ecs"
else
    TARGET="ec2"
fi

S3_BUCKET_PATH=s3://$S3_BUCKET/$TARGET/

# envファイルを検索
ENV_FILE=$(aws s3 ls "$S3_BUCKET_PATH" | grep env | awk '{print $4}' | gum filter --reverse --placeholder "Select...") # 2.

# 確認
if (gum confirm "Are you sure you want to use $ENV_FILE?"); then
    echo "You selected $ENV_FILE"
else
    die "Aborted."
fi

ENV_FILE_NAME=$(gum input --prompt.foreground "#04B575" --prompt "Enter the name of the env file: " --value ".env" --placeholder ".env")
gum spin -s meter --title "Copying env file..." -- aws s3 cp "$S3_BUCKET_PATH$ENV_FILE" "$ENV_FILE_NAME" # 3.

echo "Done."
```

1. `gum filter`を使用して、目的のS3バケットを選択します。
2. `env`という単語を含むアイテムを検索し、`ENV_FILE`という変数に割り当てます。
3. `.env`ファイルのオブジェクトキーを最終決定し、ダウンロードを進めます。

実行プロセスのデモビデオを作成しました。

![](https://i.imgur.com/CWSYRCu.gif)
_デモ_

これが終わったら、先ほど述べたように、現在のディレクトリにコピーされた`.env`ファイルをIntelliJに適用するだけです。

:::tip

[direnv](https://direnv.net/)とIntelliJのdirenvプラグインを使用すると、さらに便利に適用できます。

:::

![](https://i.imgur.com/NSIiPwn.jpeg)

## 結論

- スクリプトはシンプルであるため、メンテナンスが容易です。
- チームの反応は非常に良好です。
- 開発者は美学を評価しています。
- 機密性の高い資格情報については、AWS Secret Managerの使用を検討してください。