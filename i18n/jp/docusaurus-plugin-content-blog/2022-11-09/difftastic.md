---
title: "より直感的な 'diff' を実現する、Difftastic"
date: 2022-11-09 12:53:00 +0900
aliases:
tags: [ツール, git, diff, difftastic]
categories: [ツール]
authors: haril
---

## 概要

Difftasticは、`git diff`の使用をより便利にするためのツールです。ターミナルで頻繁に`git diff`コマンドを使用する人にとって非常に役立ちます。

## 使用方法

```bash
brew install difftastic
```

グローバル設定:

```bash
git config --global diff.external difft
```

これで、`git diff`コマンドを使用すると、以前よりもはるかに直感的な差分結果を確認できます。

![image](./1.webp)

## 参考

- [Difftastic](https://difftastic.wilfred.me.uk/introduction.html)