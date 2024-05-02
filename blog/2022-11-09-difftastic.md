---
title: "diff 를 좀 더 직관적으로, difftastic"
date: 2022-11-09 12:53:00 +0900
aliases:
tags: [tool, git, diff, difftastic]
categories: [Tools]
---

## Overview

`git diff` 를 편리하게 사용할 수 있도록 만들어주는 툴.
터미널에서 `git diff` 명령어를 사용하는 경우가 잦을 경우 아주 유용하게 사용할 수 있다.

## Usage

```bash
brew install difftastic
```

global setting:

```bash
git config --global diff.external difft
```

이제 `git diff` 명령어를 사용하면 기존보다 훨씬 직관적인 diff 결과를 볼 수 있다.

![image](/assets/img/스크린샷%202022-11-09%20오후%201.00.44.webp)

## Reference

- [difftastic](https://difftastic.wilfred.me.uk/introduction.html)
