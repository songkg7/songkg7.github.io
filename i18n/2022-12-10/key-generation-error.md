---
title: "Key Generation Error"
date: 2022-09-11 11:36:00 +0900
aliases:
tags: [gpg, keybase, security]
categories:
authors: haril
---

:::info

Here is a simple solution to resolve the error.

:::

```console
key generation error: Unknown signature subpacket: 34
```

While trying to register a GPG key on Keybase, the above error occurred. In search of a solution, I found the following workaround on GitHub.

```bash
$ gpg --edit-key mykey

gpg> showpref
[ultimate] (1). mykey
     Cipher: AES256, AES192, AES, 3DES
     AEAD: OCB, EAX
     Digest: SHA512, SHA384, SHA256, SHA224, SHA1
     Compression: ZLIB, BZIP2, ZIP, Uncompressed
     Features: MDC, AEAD, Keyserver no-modify

gpg> setpref AES256 AES192 AES 3DES SHA512 SHA384 SHA256 SHA224 SHA1 ZLIB BZIP2 ZIP
Set preference list to:
     Cipher: AES256, AES192, AES, 3DES
     AEAD:
     Digest: SHA512, SHA384, SHA256, SHA224, SHA1
     Compression: ZLIB, BZIP2, ZIP, Uncompressed
     Features: MDC, Keyserver no-modify
Really update the preferences? (y/N) y

gpg> save
```

After this, the operation should run smoothly. For more details, refer to the provided link.

## Reference

- [GitHub issue](https://github.com/keybase/keybase-issues/issues/4025)