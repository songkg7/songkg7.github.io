---
title: "Docker Volume"
date: 2022-08-03 13:38:00 +0900
tags: [devops, docker, volume]
categories: [DevOps]
authors: haril
---

## Overview

**Docker containers are completely isolated by default**, which means that data inside a container cannot be accessed from the host machine. This implies that the container's lifecycle is entirely dependent on its internal data. In simpler terms, when a container is removed, its data is also lost.

So, what should you do if you need to permanently store important data like logs or database information, independent of the container's lifecycle?

This is where `volumes` come into play.

## Installing PostgreSQL Locally

Let's explore volumes by installing and using PostgreSQL in a simple example.

### Without Using Volumes

#### 1. Pull the Image

```bash
docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=1234 -d postgres
```

#### 2. Connect to PostgreSQL

```bash
docker exec -it postgres psql -U postgres
```

#### 3. Create a User

```sql
create user testuser password '1234' superuser;
```

#### 4. Create a Database

```sql
create database testdb owner testuser;
```

You can also use tools like `DBeaver` or `DataGrip` to create users and databases.

When you're done, you can stop the container with `docker stop postgres`. Checking the container list with `docker ps -a` will show that the container is stopped but not removed.

```bash
$ docker ps -a
CONTAINER ID   IMAGE      COMMAND                  CREATED          STATUS                      PORTS     NAMES
5c72a3d21021   postgres   "docker-entrypoint.s…"   54 seconds ago   Exited (0) 43 seconds ago             postgres
```

In this state, you can restart the container with `docker start postgres` and the data will still be there.

Let's verify this.

Using the `\list` command in PostgreSQL will show that the `testdb` database still exists.

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

But what happens if you completely remove the container using the `docker rm` option?

After running `docker rm postgres` and then `docker run` again, a new container is created, and you'll see that the `testdb` and user are gone.

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

### Using Volumes

First, create a volume.

```bash
$ docker volume create postgres
postgres
```

You can verify the volume creation with the `ls` command.

```bash
$ docker volume ls
DRIVER    VOLUME NAME
local     postgres
```

Now, run the PostgreSQL container with the created volume mounted.

```bash
$ docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=1234 -v postgres:/var/lib/postgresql/data -d postgres
002c552fe092da485ee30235d809c835eeb08bd7c00e6f91a2f172618682c48e
```

The subsequent steps are the same as those without using volumes. Now, even if you completely remove the container using `docker rm`, the data will remain in the volume and won't be lost.

As mentioned earlier, for long-term storage of log files or backup data, you can use volumes to ensure data persistence independent of the container's lifecycle.

## Conclusion

We have explored what Docker volumes are and how to use them through a PostgreSQL example. Volumes are a key mechanism for data management in Docker containers. By appropriately using volumes based on the nature of the container, you can manage data safely and easily, which can significantly enhance development productivity once you get accustomed to it. For more detailed information, refer to the [official documentation](https://docs.docker.com/storage/volumes/).

## Reference

- [Use volumes](https://docs.docker.com/storage/volumes/)