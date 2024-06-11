---
title: "Macでキーボードのキーリピートを有効にする"
date: 2022-08-25 22:38:00 +0900
fc-calendar: グレゴリオ暦
fc-date: 2022-08-25
aliases:
tags: [vim, mac, 設定]
categories:
authors: haril
---

Macでは、特定のキーをしばらく押し続けると、ウムラウトなどの特殊文字入力ウィンドウが表示されることがあります。これは、Vimのようなエディタでコードナビゲーションを行う際に非常に邪魔になることがあります。

```bash
defaults write -g ApplePressAndHoldEnabled -bool false
```

上記のコマンドを実行し、アプリケーションを再起動すると、ウムラウトなどの特殊文字入力ウィンドウが表示されなくなり、キーリピートが有効になります。