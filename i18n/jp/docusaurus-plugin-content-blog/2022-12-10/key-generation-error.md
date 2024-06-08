---
title: "キー生成エラー"
date: 2022-09-11 11:36:00 +0900
aliases:
tags: [gpg, keybase, security]
categories:
authors: haril
---

:::info

ここにエラーを解決するための簡単な解決策があります。

:::

```console
key generation error: Unknown signature subpacket: 34
```

KeybaseでGPGキーを登録しようとした際に、上記のエラーが発生しました。解決策を探していると、GitHubで以下の回避策を見つけました。

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
本当に設定を更新しますか？ (y/N) y

gpg> save
```

これで操作がスムーズに進むはずです。詳細については、提供されたリンクを参照してください。

## 参考

- [GitHub issue](https://github.com/keybase/keybase-issues/issues/4025)