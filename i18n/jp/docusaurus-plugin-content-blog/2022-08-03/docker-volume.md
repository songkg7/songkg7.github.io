---
title: "Docker Volume"
date: 2022-08-03 13:38:00 +0900
tags: [devops, docker, volume]
categories: [DevOps]
authors: haril
---

## 概要

**Dockerコンテナはデフォルトで完全に隔離されています**。つまり、コンテナ内のデータはホストマシンからアクセスできません。これは、コンテナのライフサイクルがその内部データに完全に依存していることを意味します。簡単に言えば、コンテナが削除されると、そのデータも失われます。

では、ログやデータベース情報などの重要なデータをコンテナのライフサイクルに依存せずに永続的に保存するにはどうすればよいでしょうか？

ここで `ボリューム` が登場します。

## PostgreSQLのローカルインストール

簡単な例でPostgreSQLをインストールして使用しながら、ボリュームについて探ってみましょう。

### ボリュームを使用しない場合

#### 1. イメージをプルする

```bash
docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=1234 -d postgres
```

#### 2. PostgreSQLに接続する

```bash
docker exec -it postgres psql -U postgres
```

#### 3. ユーザーを作成する

```sql
create user testuser password '1234' superuser;
```

#### 4. データベースを作成する

```sql
create database testdb owner testuser;
```

`DBeaver` や `DataGrip` などのツールを使用してユーザーやデータベースを作成することもできます。

作業が終わったら、`docker stop postgres` でコンテナを停止できます。`docker ps -a` でコンテナリストを確認すると、コンテナが停止しているが削除されていないことがわかります。

```bash
$ docker ps -a
CONTAINER ID   IMAGE      COMMAND                  CREATED          STATUS                      PORTS     NAMES
5c72a3d21021   postgres   "docker-entrypoint.s…"   54 seconds ago   Exited (0) 43 seconds ago             postgres
```

この状態では、`docker start postgres` でコンテナを再起動でき、データはまだ存在しています。

これを確認してみましょう。

PostgreSQLで `\list` コマンドを使用すると、`testdb` データベースがまだ存在していることがわかります。

```sql
postgres=# \list
                                 List of databases
   Name    |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges
-----------+----------+----------+------------+------------+-----------------------
 postgres  | postgres | UTF8     | en_US.utf8 | en_US.utf8 |
 template0 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
           |          |          |            |            | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
           |          |          |            |            | postgres=CTc/postgres
 testdb    | testuser | UTF8     | en_US.utf8 | en_US.utf8 |
(4 rows)
```

しかし、`docker rm` オプションを使用してコンテナを完全に削除した場合はどうなるでしょうか？

`docker rm postgres` を実行し、その後 `docker run` を再度実行すると、新しいコンテナが作成され、`testdb` とユーザーが消えていることがわかります。

```bash
$ docker rm postgres
postgres
$ docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=1234 -d postgres
67c5c39658f5a21a833fd2fab6058f509ddac110c72749092335eec5516177c2
```

```bash
$ docker exec -it postgres psql -U postgres
psql (14.4 (Debian 14.4-1.pgdg110+1))
Type "help" for help.

postgres=# \list
                                 List of databases
   Name    |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges
-----------+----------+----------+------------+------------+-----------------------
 postgres  | postgres | UTF8     | en_US.utf8 | en_US.utf8 |
 template0 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
           |          |          |            |            | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
           |          |          |            |            | postgres=CTc/postgres
(3 rows)

postgres=#
```

### ボリュームを使用する場合

まず、ボリュームを作成します。

```bash
$ docker volume create postgres
postgres
```

`ls` コマンドでボリュームの作成を確認できます。

```bash
$ docker volume ls
DRIVER    VOLUME NAME
local     postgres
```

次に、作成したボリュームをマウントしてPostgreSQLコンテナを実行します。

```bash
$ docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=1234 -v postgres:/var/lib/postgresql/data -d postgres
002c552fe092da485ee30235d809c835eeb08bd7c00e6f91a2f172618682c48e
```

その後の手順は、ボリュームを使用しない場合と同じです。これで、`docker rm` を使用してコンテナを完全に削除しても、データはボリュームに残り、失われることはありません。

前述のように、ログファイルやバックアップデータの長期保存には、ボリュームを使用してデータの永続性を確保することができます。

## 結論

Dockerボリュームとは何か、そしてそれをどのように使用するかをPostgreSQLの例を通じて探りました。ボリュームはDockerコンテナにおけるデータ管理の重要なメカニズムです。コンテナの性質に応じて適切にボリュームを使用することで、データを安全かつ簡単に管理でき、慣れれば開発の生産性を大幅に向上させることができます。詳細な情報については、[公式ドキュメント](https://docs.docker.com/storage/volumes/) を参照してください。

## 参考文献

- [Use volumes](https://docs.docker.com/storage/volumes/)