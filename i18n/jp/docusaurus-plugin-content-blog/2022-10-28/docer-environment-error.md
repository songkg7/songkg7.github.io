---
title: "有効なDocker環境が見つかりませんでした"
date: 2022-10-28 11:26:00 +0900
aliases:
tags: [エラー, docker]
categories: [DevOps, Docker]
authors: haril
description: "この記事では、macOS上のDocker Desktopで発生する「有効なDocker環境が見つかりませんでした」エラーの解決方法を説明します。"
---

## 概要

Macをアップデートした後、Dockerが正常に動作しなくなり、再インストールする必要がありました。しかし、テストを実行するとコンテナが正常に動作しないエラーに遭遇しました。

調べてみると、`/var/run/docker.sock`が正しく設定されていないことが原因でした。ここでは、この問題を解決する方法を共有します。

## 説明

この問題はDocker Desktopバージョン`4.13.0`で発生します。

> _デフォルトでは、Dockerはホスト上に/var/run/docker.sockシンボリックリンクを作成せず、代わりにdocker-desktop CLIコンテキストを使用します。_ (参照: [https://docs.docker.com/desktop/release-notes/](https://docs.docker.com/desktop/release-notes/))

現在のDockerコンテキストは`docker context ls`コマンドで確認できます。以下のように表示されます：

```console
NAME                TYPE                DESCRIPTION                               DOCKER ENDPOINT                                KUBERNETES ENDPOINT                                 ORCHESTRATOR
default             moby                Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                    https://kubernetes.docker.internal:6443 (default)   swarm
desktop-linux *     moby                                                          unix:///Users/<USER>/.docker/run/docker.sock
```

問題を解決するには、デフォルトのコンテキストを設定するか、`unix:///Users/<USER>/.docker/run/docker.sock`に接続します。

## 解決方法

以下のコマンドを実行してデフォルトのコンテキストに切り替え、Dockerが正常に動作するか確認してください：

```bash
docker context use default
```

問題が解決しない場合は、以下のコマンドでシンボリックリンクを手動で作成して解決できます：

```bash
sudo ln -svf /Users/<USER>/.docker/run/docker.sock /var/run/docker.sock
```

## 参考

- [Stack Overflow](https://stackoverflow.com/questions/74173489/docker-socket-is-not-found-while-using-intellij-idea-and-docker-desktop-on-macos)