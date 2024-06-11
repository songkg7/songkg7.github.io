---
title: "Dockerネットワーク"
date: 2022-08-09 22:27:00 +0900
tags: [devops, docker, network]
categories: [DevOps]
authors: haril
---

## 概要

Dockerコンテナは隔離された環境で実行されるため、デフォルトでは互いに通信できません。しかし、複数のコンテナを1つのDockerネットワークに接続することで、相互に通信が可能になります。この記事では、異なるコンテナ間の通信を実現するためのネットワーク設定方法について探ります。

## ネットワークの種類

Dockerネットワークは、目的に応じて`bridge`、`host`、`overlay`などのさまざまなネットワークドライバーをサポートしています。

- `bridge`: 単一ホスト内の複数のコンテナ間で通信を可能にします。
- `host`: コンテナをホストコンピュータと同じネットワークで実行するために使用されます。
- `overlay`: 複数のホスト上で実行されるコンテナ間のネットワーキングに使用されます。

## ネットワークの作成

`docker network create`コマンドを使用して、新しいDockerネットワークを作成しましょう。

```bash
docker network create my-net
```

新しく追加されたネットワークは、`docker network ls`コマンドを使用して確認できます。`-d`オプションを指定しなかったため、デフォルトの`bridge`ネットワークとして作成されたことが確認できます。

## ネットワークの詳細

`docker network inspect`コマンドを使用して、新しく追加されたネットワークの詳細を確認しましょう。

```bash
docker network inspect my-net
[
    {
        "Name": "my-net",
        "Id": "05f28107caa4fc699ea71c07a0cb7a17f6be8ee65f6001ed549da137e555b648",
        "Created": "2022-08-02T09:05:20.250288712Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]
```

`Containers`セクションを確認すると、このネットワークに接続されているコンテナがないことがわかります。

## コンテナをネットワークに接続する

まず、`one`という名前のコンテナを実行しましょう。

```bash
docker run -it -d --name one busybox
# af588368c67b8a273cf63a330ee5191838f261de1f3e455de39352e0e95deac4
```

コンテナを実行する際に`--network`オプションを指定しない場合、デフォルトで`bridge`ネットワークに接続されます。

:::info

`busybox`は、テスト目的に最適な軽量のコマンドラインライブラリであり、Dockerが公式に提供しています。

:::

```bash
docker network inspect bridge
#...
        "Containers": {
            "af588368c67b8a273cf63a330ee5191838f261de1f3e455de39352e0e95deac4": {
                "Name": "one",
                "EndpointID": "44a4a022cc0f5fb30e53f0499306db836fe64da15631f2abf68ebc74754d9750",
                "MacAddress": "02:42:ac:11:00:02",
                "IPv4Address": "172.17.0.2/16",
                "IPv6Address": ""
            }
        },
#...
]
```

次に、`docker network connect`コマンドを使用して、`one`コンテナを`my-net`ネットワークに接続しましょう。

```bash
docker network connect my-net one
```

`my-net`ネットワークの詳細を再確認すると、`one`コンテナが`Containers`セクションに追加され、IPアドレス`172.18.0.2`が割り当てられていることがわかります。

```bash
docker network inspect my-net
[
    {
        "Name": "my-net",
        "Id": "05f28107caa4fc699ea71c07a0cb7a17f6be8ee65f6001ed549da137e555b648",
        "Created": "2022-08-02T09:05:20.250288712Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "af588368c67b8a273cf63a330ee5191838f261de1f3e455de39352e0e95deac4": {
                "Name": "one",
                "EndpointID": "ac85884c9058767b037b88102fe6c35fb65ebf91135fbce8df24a173b0defcaa",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

## コンテナをネットワークから切断する

コンテナは同時に複数のネットワークに接続できます。`one`コンテナは最初に`bridge`ネットワークに接続されていたため、現在は`my-net`と`bridge`の両方のネットワークに接続されています。

`docker network disconnect`コマンドを使用して、`one`コンテナを`bridge`ネットワークから切断しましょう。

```bash
docker network disconnect bridge one
```

## 2つ目のコンテナを接続する

次に、`two`という名前のコンテナを`my-net`ネットワークに接続しましょう。

今回は、コンテナを実行する際に`--network`オプションを使用して接続するネットワークを指定します。

```bash
docker run -it -d --name two --network my-net busybox
# b1509c6fcdf8b2f0860902f204115017c3e2cc074810b330921c96e88ffb408e
```

`my-net`ネットワークの詳細を確認すると、`two`コンテナがIPアドレス`172.18.0.3`を割り当てられて接続されていることがわかります。

```bash
docker network inspect my-net
[
    {
        "Name": "my-net",
        "Id": "05f28107caa4fc699ea71c07a0cb7a17f6be8ee65f6001ed549da137e555b648",
        "Created": "2022-08-02T09:05:20.250288712Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "af588368c67b8a273cf63a330ee5191838f261de1f3e455de39352e0e95deac4": {
                "Name": "one",
                "EndpointID": "ac85884c9058767b037b88102fe6c35fb65ebf91135fbce8df24a173b0defcaa",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            },
            "b1509c6fcdf8b2f0860902f204115017c3e2cc074810b330921c96e88ffb408e": {
                "Name": "two",
                "EndpointID": "f6e40a7e06300dfad1f7f176af9e3ede26ef9394cb542647abcd4502d60c4ff9",
                "MacAddress": "02:42:ac:12:00:03",
                "IPv4Address": "172.18.0.3/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

## コンテナ間のネットワーキング

2つのコンテナがネットワーク上で通信できるかどうかをテストしましょう。

まず、`one`コンテナから`two`コンテナに`ping`コマンドを使用してpingを送ります。コンテナ名をホスト名として使用できます。

```bash
docker exec one ping two
# PING two (172.18.0.3): 56 data bytes
# 64 bytes from 172.18.0.3: seq=0 ttl=64 time=0.114 ms
# 64 bytes from 172.18.0.3: seq=1 ttl=64 time=0.915 ms
```

次に、`two`コンテナから`one`コンテナにpingを送ります。

```bash
docker exec two ping one
# PING one (172.18.0.2): 56 data bytes
# 64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.108 ms
# 64 bytes from 172.18.0.2: seq=1 ttl=64 time=0.734 ms
# 64 bytes from 172.18.0.2: seq=2 ttl=64 time=0.270 ms
# 64 bytes from 172.18.0.2: seq=3 ttl=64 time=0.353 ms
# 64 bytes from 172.18.0.2: seq=4 ttl=64 time=0.371 ms
```

両方のコンテナがスムーズに通信できることが確認できました。

## ネットワークの削除

最後に、`docker network rm`コマンドを使用して`my-net`ネットワークを削除しましょう。

```bash
docker network rm my-net
# Error response from daemon: error while removing network: network my-net id 05f28107caa4fc699ea71c07a0cb7a17f6be8ee65f6001ed549da137e555b648 has active endpoints
```

削除しようとしているネットワークにアクティブなコンテナが存在する場合、ネットワークは削除されません。

その場合、ネットワークを削除する前に、そのネットワークに接続されているすべてのコンテナを停止する必要があります。

```bash
docker stop one two
# one
# two
docker network rm my-net
# my-net
```

## ネットワークのクリーンアップ

ホスト上で複数のコンテナを実行していると、コンテナが接続されていないネットワークが残ることがあります。そのような場合、`docker network prune`コマンドを使用して、不要なネットワークを一度にすべて削除できます。

```bash
docker network prune
WARNING! This will remove all custom networks not used by at least one container.
Are you sure you want to continue? [y/N] y
```

## 結論

この記事では、さまざまな`docker network`コマンドについて探りました：

- `ls`
- `create`
- `connect`
- `disconnect`
- `inspect`
- `rm`
- `prune`

ネットワークの理解は、Dockerコンテナを扱う際に重要です。データベースのコンテナ化やコンテナクラスタリングの実装など、複数のコンテナを効果的に管理するための重要なスキルです。

## 参考文献

- [Docker Docs - Network](https://docs.docker.com/engine/reference/commandline/network/)
- [Docker Network Usage](https://www.daleseo.com/docker-networks/)