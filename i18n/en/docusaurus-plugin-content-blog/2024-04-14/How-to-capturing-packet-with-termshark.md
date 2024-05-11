---
title: Understanding 3 Way Handshake with Termshark through Packets
date: 2024-04-14 14:32:47 +0900
aliases: 
tags:
  - network
  - packet
  - tshark
  - termshark
  - wireshark
categories: 
image: /img/banner/termshark-banner.webp
updated: 2024-04-14 14:33:15 +0900
authors: haril
---

![banner](./termshark-banner.webp)

## What are Network Packets?

How do we transmit data over a network? Establishing a connection with the recipient and sending the data all at once might seem like the most straightforward approach. However, this method becomes inefficient when handling multiple requests because a single connection can only maintain one data transfer at a time. If a connection is prolonged due to a large data transfer, other data will have to wait.

To efficiently handle the data transmission process, networks divide data into multiple pieces and require the receiving end to reassemble them. These fragmented data structures are called packets. Packets include additional information to allow the receiving end to reassemble the data in the correct order.

While transmitting data in multiple packets enables efficient processing of many requests through packet switching, it can also lead to various errors such as data loss or incorrect delivery order. How should we debug such issues? 🤔

<!-- truncate -->

## Wireshark? No...! It's Termshark Time!

Network operations are often obscured by the kernel, making packet analysis tools essential for effective debugging. Naturally, there are already many tools available, with Wireshark being a prominent example.

However, in this article, we will explore a method to analyze packets even in environments where graphical user interfaces like Wireshark cannot be used. We will utilize `termshark`, the TUI version of Wireshark, for this purpose. Its straightforward usage allows for easy network analysis.

## Installation and Usage

Since we are focusing on Mac, we will proceed with the installation using `brew`.

```bash
brew install termshark
```

To inspect packets, you need to specify which network device to capture packets passing through. You can use `termshark` to check the network devices present on your current machine.

```bash
termshark -D
```

You can also use the basic command `ifconfig` to check.

```bash
ifconfig
```

For our testing, we will use the loopback interface (localhost). Upon examining the output, we find a loopback interface named `lo0`. The following command captures network packets:

```bash
termshark -i lo0 -w test.pcap # Capture packets and save them to a file named test.pcap
```

Running Termshark will put you in a state of capturing network packets.

Hmm... Since the loopback interface sends network requests to localhost, we need an application running locally. Let's open another terminal window and run a simple server application using Docker.

```bash
docker run -d -p 8080:8080 songkg7/rest-server
```

This server responds with the string "pong" when a GET request is made to the `/ping` endpoint. Although the message is short, it should be sufficient for a brief examination of packet operations.

Now, send a request to the loopback,

:::info

If you don't have `Httpie` installed, you can use `curl` instead or install it with `brew install httpie`.

:::

```bash
http localhost:8080/ping
```

To stop capturing in the tshark session, press `ctrl + c`. Typing `la` will confirm that the `test.pcap` file has been created.

## Packet Analysis

The packet capture process is now complete. Let's see what requests were made during the capture! Instead of viewing everything, you can specify filtering conditions to view only the requests you are interested in.

```bash
termshark -r test.pcap tcp.port==8080 # View packets exchanged over port 8080
```

Termshark provides basic key controls:

- Arrow keys or hjkl: Move the cursor
- `tab`: Switch focus between windows
- `?`: Help
- `/`: Filter, allowing you to view specific packets like `tcp.port==8080`
- `q`: Quit

Termshark shares a color palette with Wireshark and provides intuitive visualization even with the default settings. If you wish to change the colors, you can adjust the Wireshark settings, but we will skip that as it slightly deviates from the focus of this article.

Returning to the topic of packets, while packet dumps provide a wealth of information, let's focus on a few key details. The basic TCP operation flow progresses as shown in the image below.

![](https://i.imgur.com/qiDbLAK.png)

At the top, you can observe the 3-way handshake process, progressing from SYN to SYN, ACK, and finally to ACK. Once this process is completed, the connection enters the ESTABLISHED state, signifying a successful connection establishment.

A closer look reveals that during the initial stages, sequence numbers are exchanged to determine how far data has been transmitted between the parties.

![](https://i.imgur.com/HUcOEVH.png)
_Client-side sequence number is handed to the server during the SYN request_

During the SYN request, the client side conveys the sequence number (4175220519) set by the client to the server, and then,

![](https://i.imgur.com/ONbTNaM.png)

the server responds (SYN ACK) by returning its sequence number (1538881812) along with a request for the next sequence number to be received. The Acknowledge Number signifies the next sequence number expected to be received. From the server's perspective, having received 4175220519 from the client, it requests 4175220520 as the next sequence number.

Examining the final packet of the 3-way handshake, the ACK,

![](https://i.imgur.com/6wew0fe.png)

it attempts to transmit the sequence number 4175220520 and requests an increment from the received sequence number at the server, 1538881812, resulting in 1538881812 + 1 = 1538881813. The connection state has transitioned to CLIENT_ESTABLISHED.

:::info

Sequence numbers do not start from 0 or 1 to prevent interference with packets during communication. By assigning a random number during the initial connection request, packet interference is minimized.

:::

## Conclusion

We have explored a simple method of packet analysis using `termshark`. In this article, we focused on the 3-way handshake to manage the length, but packet analysis provides a wealth of information. We hope this serves as an opportunity to delve into network operations.

## Reference

- [Cloudflare - what is a packet](https://www.cloudflare.com/ko-kr/learning/network-layer/what-is-a-packet/)
- [how to wireshark tcp conversation completeness](https://www.chappell-university.com/post/how-to-wireshark-tcp-conversation-completeness)
