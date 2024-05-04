---
sidebar_position: 3
---

# 설정

O2 supports multiple platforms. Each platform has its own settings. You can configure the settings in the plugin settings tab.

## Jekyll

```text
your jekyll project (ex: /Users/user1/Documents/GitHub/user1.github.io)
├── _posts (where the converted notes are placed)
└── assets
    └── img
        └── yyyy-MM-dd-title (where the attachments are placed. yyyy-MM-dd is replaced by the date of converting)
```

- jekyllPath is the path of your jekyll project (ex: /Users/user1/Documents/GitHub/user1.github.io).
- Attachments will be copied by the date under the `assets/img/<yyyy-MM-dd>` folder.
- Auto create folders: If enabled, the plugin will automatically create the necessary folders if they do not exist. You can toggle this setting in the plugin settings tab.

## Docusaurus

:::caution

WIP

:::
