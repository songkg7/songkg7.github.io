---
sidebar_position: 1
---

# About

O2 is a tool that converts your Obsidian Markdown files to other Markdown platforms such as Jekyll.

But, currently, it only supports Jekyll. I will add more platforms in the future.
If you have any suggestions, please let me know.

## Prerequisites

### Structure of your vault

You should have a folder structure like this. (of course, you can change the folder names in settings)

```text
Your vault
├── ready (where the notes you want to convert are placed)
├── backup (where the original notes before converting are placed)
└── attachments (where the attachments are placed)
```

Other Folders will be ignored.

## How to use

If you want to convert your notes, you should move them to the `ready` Folder.

then, Execute the command `O2: convert to Jekyll Chirpy` via obsidian's `cmd + p` shortcut.

if exception occurs, you can see the original note in the `backup` folder.

