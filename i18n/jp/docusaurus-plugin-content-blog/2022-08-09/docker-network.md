---
title: "Docker Network"
date: 2022-08-09 22:27:00 +0900
tags: [devops, docker, network]
categories: [DevOps]
authors: haril
---

## Overview

Since Docker containers run in isolated environments, they cannot communicate with each other by default. However, connecting multiple containers to a single Docker network enables them to communicate. In this article, we will explore how to configure networks for communication between different containers.

## Types of Networks

Docker networks support various types of network drivers such as `bridge`, `host`, and `overlay` based on their purposes.

- `bridge`: Allows multiple containers within a single host to communicate with each other.
- `host`: Used to run containers in the same network as the host computer.
- `overlay`: Used for networking between containers running on multiple hosts.

## Creating a Network

Let's create a new Docker network using the `docker network create` command.

```bash
docker network create my-net
```

The newly added network can be verified using the `docker network ls` command, which confirms that it was created as a default `bridge` network since the `-d` option was not specified.

## Network Details

Let's inspect the details of the newly added network using the `docker network inspect` command.

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

By checking the `Containers` section, we can see that no containers are connected to this network.

## Connecting Containers to the Network

Let's first run a container named `one`.

```bash
docker run -it -d --name one busybox
# af588368c67b8a273cf63a330ee5191838f261de1f3e455de39352e0e95deac4
```

If the `--network` option is not specified when running a container, it will by default connect to the `bridge` network.

:::info

`busybox` is a lightweight command-line library ideal for testing purposes, officially provided by Docker.

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

Now, let's connect the `one` container to the `my-net` network using the `docker network connect` command.

```bash
docker network connect my-net one
```

Upon rechecking the details of the `my-net` network, we can see that the `one` container has been added to the `Containers` section with the IP `172.18.0.2`.

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

## Disconnecting a Container from the Network

A container can be connected to multiple networks simultaneously. Since the `one` container was initially connected to the `bridge` network, it is currently connected to both the `my-net` and `bridge` networks.

Let's disconnect the `one` container from the `bridge` network using the `docker network disconnect` command.

```bash
docker network disconnect bridge one
```

## Connecting a Second Container

Let's connect another container named `two` to the `my-net` network.

This time, let's specify the network to connect to while running the container using the `--network` option.

```bash
docker run -it -d --name two --network my-net busybox
# b1509c6fcdf8b2f0860902f204115017c3e2cc074810b330921c96e88ffb408e
```

Upon inspecting the details of the `my-net` network, we can see that the `two` container has been assigned the IP `172.18.0.3` and connected.

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

## Container Networking

Let's test if the two containers can communicate with each other over the network.

First, let's use the `ping` command from the `one` container to ping the `two` container. Container names can be used as hostnames.

```bash
docker exec one ping two
# PING two (172.18.0.3): 56 data bytes
# 64 bytes from 172.18.0.3: seq=0 ttl=64 time=0.114 ms
# 64 bytes from 172.18.0.3: seq=1 ttl=64 time=0.915 ms
```

Next, let's ping the `one` container from the `two` container.

```bash
docker exec two ping one
# PING one (172.18.0.2): 56 data bytes
# 64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.108 ms
# 64 bytes from 172.18.0.2: seq=1 ttl=64 time=0.734 ms
# 64 bytes from 172.18.0.2: seq=2 ttl=64 time=0.270 ms
# 64 bytes from 172.18.0.2: seq=3 ttl=64 time=0.353 ms
# 64 bytes from 172.18.0.2: seq=4 ttl=64 time=0.371 ms
```

Both containers can communicate smoothly.

## Removing the Network

Finally, let's remove the `my-net` network using the `docker network rm` command.

```bash
docker network rm my-net
# Error response from daemon: error while removing network: network my-net id 05f28107caa4fc699ea71c07a0cb7a17f6be8ee65f6001ed549da137e555b648 has active endpoints
```

If there are active containers running on the network you are trying to remove, it will not be deleted.

In such cases, you need to stop all containers connected to that network before deleting the network.

```bash
docker stop one two
# one
# two
docker network rm my-net
# my-net
```

## Network Cleanup

When running multiple containers on a host, you may end up with networks that have no containers connected to them. In such cases, you can use the `docker network prune` command to remove all unnecessary networks at once.

```bash
docker network prune
WARNING! This will remove all custom networks not used by at least one container.
Are you sure you want to continue? [y/N] y
```

## Conclusion

In this article, we explored various `docker network` commands:

- `ls`
- `create`
- `connect`
- `disconnect`
- `inspect`
- `rm`
- `prune`

Understanding networks is essential when working with Docker containers, whether for containerizing databases or implementing container clustering. It is crucial to have a good grasp of networking as a key skill for managing multiple containers effectively.

## Reference

- [Docker Docs - Network](https://docs.docker.com/engine/reference/commandline/network/)
- [Docker Network Usage](https://www.daleseo.com/docker-networks/)