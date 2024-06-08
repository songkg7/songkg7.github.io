---
title: "Enable Keyboard Key Repeat on Mac"
date: 2022-08-25 22:38:00 +0900
fc-calendar: Gregorian Calendar
fc-date: 2022-08-25
aliases:
tags: [vim, mac, configuration]
categories:
authors: haril
---

On a Mac, when you press and hold a specific key for a while, a special character input window like umlauts may appear. This can be quite disruptive when using editors like Vim for code navigation.

```bash
defaults write -g ApplePressAndHoldEnabled -bool false
```

After running the above command and restarting the application, the special character input window, such as umlauts, will no longer appear and key repetition will be enabled.