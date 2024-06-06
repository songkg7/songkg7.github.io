---
title: "chezmoiを最大限に活用する方法"
date: 2023-04-08 18:26:00 +0900
aliases: 
tags: [chezmoi, dotfiles]
categories: 
authors: haril
---

[前回の記事](https://haril.dev/blog/2023/03/26/chezmoi-awesome-dotfile-manager)に続いて、chezmoiをより効果的に活用する方法をいくつか紹介します。

:::info

現在使用している設定は[こちら](https://github.com/songkg7/dotfiles)で確認できます。

:::

## 使い方

chezmoiのコマンドの使い方は`chezmoi help`や公式ドキュメントで確認できますが、この記事ではchezmoiをより便利に使うための高度な方法を説明します。

### 設定

chezmoiは設定ファイルとして`~/.config/chezmoi/chezmoi.toml`を使用します。ツール固有の設定が必要な場合、このファイルに定義できます。`toml`だけでなく、`yaml`や`json`もサポートしているので、慣れた形式で記述できます。公式ドキュメントでは`toml`を使っているので、ここでもデフォルトとして`toml`を使って説明します。

#### マージツールとデフォルトエディタの設定

**chezmoiのデフォルトエディタはviです**。私は主にnvimを使っているので、デフォルトエディタをnvimに変更する方法を紹介します。

```bash
chezmoi edit-config
```

```toml
[edit]
    command = "nvim"

[merge]
    command = "nvim"
    args = ["-d", "{% raw %}{{ .Destination }}{% endraw %}", "{% raw %}{{ .Source }}{% endraw %}", "{% raw %}{{ .Target }}{% endraw %}"]
```

VScodeを使っている場合は、次のように設定できます：

```toml
[edit]
    command = "code"
    args = ["--wait"]
```

#### テンプレートを使ったgitconfigの管理

一部の設定を統一するのではなく、環境ごとに異なる設定が必要な場合があります。例えば、仕事用と個人用で異なるgitconfig設定が必要な場合です。このように特定のデータだけを分けたい場合、chezmoiではテンプレートという方法を使って環境変数を注入することができます。

まず、gitconfigファイルを作成します：

```bash
mkdir ~/.config/git
touch ~/.config/git/config
```

gitconfigをテンプレートとして登録し、変数の使用を可能にします：

```bash
chezmoi add --template ~/.config/git/config
```

データの置換が必要な部分を記述します：

```bash
chezmoi edit ~/.config/git/config
```

```text
[user]
    name = {% raw %}{{ .name }}{% endraw %}
    email = {% raw %}{{ .email }}{% endraw %}
```

これらの中括弧はローカル環境で定義された変数で埋められます。デフォルトの変数リストは`chezmoi data`で確認できます。

変数を`chezmoi.toml`に記述します：

```bash
# `chezmoi edit-config`の代わりにローカル設定を記述します。
vi ~/.config/chezmoi/chezmoi.toml
```

```toml
[data]
    name = "privateUser"
    email = "private@gmail.com"
```

これらをすべて記述した後、`chezmoi apply -vn`や`chezmoi init -vn`を使って、テンプレート変数がデータ値で埋められたconfigファイルが生成されるのを確認してみてください。

#### 自動コミットとプッシュ

`chezmoi edit`でdotfilesを編集するだけでは、ローカルリポジトリのgitに変更が自動的に反映されません。

```bash
# 手動で行う必要があります。
chezmoi cd
git add .
git commit -m "update something"
git push
```

このプロセスを自動化するには、`chezmoi.toml`に設定を追加する必要があります。

```toml
# `~/.config/chezmoi/chezmoi.toml`
[git]
    # autoAdd = true
    autoCommit = true # add + commit
    autoPush = true
```

ただし、プッシュも自動化すると、機密ファイルが誤ってリモートリポジトリにアップロードされる可能性があります。したがって、個人的には**コミットまでの自動オプションのみを有効にすることをお勧めします**。

### Brewパッケージの管理

仕事で便利なツールを見つけたら、個人環境にもインストールするのを忘れないようにしましょう。chezmoiで管理しましょう。

```bash
chezmoi cd
vi run_once_before_install-packages-darwin.sh.tmpl
```

`run_once_`はchezmoiが使用するスクリプトキーワードで、一度も実行されていない場合にのみスクリプトを実行したいときに使用します。`before_`キーワードを使用することで、dotfilesを作成する前にスクリプトを実行できます。これらのキーワードを使用して記述されたスクリプトは、次の2つの場合に実行されます：

- 初回セットアップ時（これまでに一度も実行されていない場合）
- スクリプト自体が変更された場合（更新）

これらのキーワードを使用してbrew bundleをスクリプト化することで、すべての環境で統一されたbrewパッケージを持つことができます。以下は私が使用しているスクリプトです：

```bash
# MacOSでのみ実行
{% raw %}{{- if eq .chezmoi.os "darwin" -}}{% endraw %}
#!/bin/bash

PACKAGES=(
    asdf
    exa
    ranger
    chezmoi
    difftastic
    gnupg
    fzf
    gh
    glab
    htop
    httpie
    neovim
    nmap
    starship
    daipeihust/tap/im-select
)

CASKS=(
    alt-tab
    shottr
    raycast
    docker
    hammerspoon
    hiddenbar
    karabiner-elements
    obsidian
    notion
    slack
    stats
    visual-studio-code
    warp
    wireshark
    google-chrome
)

# Homebrewがインストールされていない場合はインストール
if test ! $(which brew); then
   printf '\n\n\e[33mHomebrewが見つかりません。 \e[0mHomebrewをインストールします...'
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
else
  printf '\n\n\e[0mHomebrewが見つかりました。続行します...'
fi

# Homebrewパッケージを更新
printf '\nHomebrewの更新を開始します...\n'
brew update

printf '\nパッケージをインストールしています...\n'
brew install ${PACKAGES[@]}

printf '\n\n古いパッケージを削除しています...\n'
brew cleanup

printf '\n\ncaskアプリをインストールしています...\n'
brew install --cask ${CASKS[@]}

{% raw %}{{ end -}}{% endraw %}
```

shに詳しくなくても、それほど難しくないはずです。`brew install`でインストールするパッケージのリストを`PACKAGES`に、`brew install --cask`でインストールするアプリケーションのリストを`CASKS`に定義します。インストールプロセスはスクリプトによって実行されます。

スクリプト化はchezmoiの機能の中でも比較的複雑な機能です。適用方法はさまざまで、同じ機能を異なる方法で定義することもできます。詳細な使用方法については、[公式ドキュメント](https://www.chezmoi.io/user-guide/use-scripts-to-perform-actions/#set-environment-variables)を参照してください。

## 結論

この記事では、前回の記事で説明した基本的な使い方に続いて、便利なchezmoiの設定をまとめました。最後に紹介したスクリプトの使用は、基本設定のタイトルに反してやや複雑に見えるかもしれませんが、一度適用すれば非常に便利に使えるようになります。

## 参考

- [chezmoi](https://www.chezmoi.io/user-guide/command-overview/)