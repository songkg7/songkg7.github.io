---
title: "Could not find a valid Docker environment"
date: 2022-10-28 11:26:00 +0900
aliases:
tags: [error, docker]
categories: [DevOps, Docker]
authors: haril
description: "This article explains how to resolve the 'Could not find a valid Docker environment' error in Docker Desktop on macOS."
---

## Overview

After updating my Mac and finding that Docker was not working properly, I had to reinstall it. However, I encountered an error where the container was not running properly when running tests.

It turned out that there was an issue with the `/var/run/docker.sock` not being properly configured. Here, I will share the solution to resolve this issue.

## Description

This problem occurs in Docker desktop version `4.13.0`.

> _By default Docker will not create the /var/run/docker.sock symlink on the host and use the docker-desktop CLI context instead._ (see: [https://docs.docker.com/desktop/release-notes/](https://docs.docker.com/desktop/release-notes/))

You can check the current Docker context using `docker context ls`, which will display something like this:

```console
NAME                TYPE                DESCRIPTION                               DOCKER ENDPOINT                                KUBERNETES ENDPOINT                                 ORCHESTRATOR
default             moby                Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                    https://kubernetes.docker.internal:6443 (default)   swarm
desktop-linux *     moby                                                          unix:///Users/<USER>/.docker/run/docker.sock
```

To fix the issue, either set the default context or connect to `unix:///Users/<USER>/.docker/run/docker.sock`.

## Solution

Try running the following command to switch to the default context and check if Docker works properly:

```bash
docker context use default
```

If the issue persists, you can manually create a symbolic link to resolve it with the following command:

```bash
sudo ln -svf /Users/<USER>/.docker/run/docker.sock /var/run/docker.sock
```

## Reference

- [Stack overflow](https://stackoverflow.com/questions/74173489/docker-socket-is-not-found-while-using-intellij-idea-and-docker-desktop-on-macos)
