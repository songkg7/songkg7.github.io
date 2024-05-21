---
title: "Getting the Most Out of chezmoi"
date: 2023-04-08 18:26:00 +0900
aliases: 
tags: [chezmoi, dotfiles]
categories: 
authors: haril
---

Following on from the [previous post](https://songkg7.github.io/posts/chezmoi-awesome-dotfile-manager/), I'll share some ways to make better use of chezmoi.

:::info

You can check out the settings I'm currently using [here](https://github.com/songkg7/dotfiles).

:::

## How to Use It

You can find the usage of chezmoi commands with `chezmoi help` and in the official documentation. In this post, I'll explain some advanced ways to use chezmoi more conveniently.

### Settings

chezmoi uses the `~/.config/chezmoi/chezmoi.toml` file for settings. If you need tool-specific settings, you can define them in this file. It supports not only `toml` but also `yaml` and `json`, so you can write in a format you are familiar with. Since the official documentation guides with `toml`, I'll also explain using `toml` as the default.

#### Setting Merge Tool and Default Editor

**chezmoi uses vi as the default editor**. Since I mainly use nvim, I'll show you how to modify it to use nvim as the default editor.

```bash
chezmoi edit-config
```

```toml
[edit]
    command = "nvim"

[merge]
    command = "nvim"
    args = ["-d", "{% raw %}{{ .Destination }}{% endraw %}", "{% raw %}{{ .Source }}{% endraw %}", "{% raw %}{{ .Target }}{% endraw %}"]
```

If you use VScode, you can set it up like this:

```toml
[edit]
    command = "code"
    args = ["--wait"]
```

#### Managing gitconfig Using Templates

Sometimes you may need separate configurations rather than uniform settings. For example, you might need different gitconfig settings for work and personal environments. In such cases where only specific data needs to be separated while the rest remains similar, chezmoi allows you to control this through a method called templates, which inject environment variables.

First, create a gitconfig file:

```bash
mkdir ~/.config/git
touch ~/.config/git/config
```

Register gitconfig as a template to enable the use of variables:

```bash
chezmoi add --template ~/.config/git/config
```

Write the parts where data substitution is needed:

```bash
chezmoi edit ~/.config/git/config
```

```text
[user]
    name = {% raw %}{{ .name }}{% endraw %}
    email = {% raw %}{{ .email }}{% endraw %}
```

These curly braces will be filled with variables defined in the local environment. You can check the default variable list with `chezmoi data`.

Write the variables in `chezmoi.toml`:

```bash
# Write local settings instead of `chezmoi edit-config`.
vi ~/.config/chezmoi/chezmoi.toml
```

```toml
[data]
    name = "privateUser"
    email = "private@gmail.com"
```

After writing all this, try using `chezmoi apply -vn` or `chezmoi init -vn` to see the template variables filled with data values in the config file that is generated.

#### Auto Commit and Push

Simply editing dotfiles with `chezmoi edit` does not automatically reflect changes to the git in the local repository.

```bash
# You have to do it manually.
chezmoi cd
git add .
git commit -m "update something"
git push
```

To automate this process, you need to add settings to `chezmoi.toml`.

```toml
# `~/.config/chezmoi/chezmoi.toml`
[git]
    # autoAdd = true
    autoCommit = true # add + commit
    autoPush = true
```

However, if you automate the push as well, sensitive files could accidentally be uploaded to the remote repository. Therefore, personally, I recommend **activating only the auto option until commit**.

### Managing Brew Packages

If you find a useful tool at work, don't forget to install it in your personal environment too. Let's manage it with chezmoi.

```bash
chezmoi cd
vi run_once_before_install-packages-darwin.sh.tmpl
```

The `run_once_` is a script keyword used by chezmoi. It is used when you want to run a script only if it has not been executed before. By using the `before_` keyword, you can run the script before creating dotfiles. The script written using these keywords is executed in two cases:

- When it has never been executed before (initial setup)
- When the script itself has been modified (update)

By scripting brew bundle using these keywords, you can have uniform brew packages across all environments. Here is the script I am using:

```bash
# Only run on MacOS
{% raw %}{{- if eq .chezmoi.os "darwin" -}}{% endraw %}
#!/bin/bash

PACKAGES=(
    asdf
    exa
    ranger
    chezmoi
    difftastic
    gnupg
    fzf
    gh
    glab
    htop
    httpie
    neovim
    nmap
    starship
    daipeihust/tap/im-select
)

CASKS=(
    alt-tab
    shottr
    raycast
    docker
    hammerspoon
    hiddenbar
    karabiner-elements
    obsidian
    notion
    slack
    stats
    visual-studio-code
    warp
    wireshark
    google-chrome
)

# Install Homebrew if not already installed
if test ! $(which brew); then
   printf '\n\n\e[33mHomebrew not found. \e[0mInstalling Homebrew...'
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
else
  printf '\n\n\e[0mHomebrew found. Continuing...'
fi

# Update homebrew packages
printf '\nInitiating Homebrew update...\n'
brew update

printf '\nInstalling packages...\n'
brew install ${PACKAGES[@]}

printf '\n\nRemoving out of date packages...\n'
brew cleanup

printf '\n\nInstalling cask apps...\n'
brew install --cask ${CASKS[@]}

{% raw %}{{ end -}}{% endraw %}
```

Even if you are not familiar with sh, it shouldn't be too difficult to understand. Define the `PACKAGES` list for packages installed with `brew install` and `CASKS` for applications installed with `brew install --cask`. The installation process will be carried out by the script.

Scripting is a relatively complex feature among the functionalities available in chezmoi. There are various ways to apply it, and the same function can be defined differently. For more detailed usage, refer to the [official documentation](https://www.chezmoi.io/user-guide/use-scripts-to-perform-actions/#set-environment-variables).

## Conclusion

In this post, I summarized useful chezmoi settings following the basic usage explained in the previous post. The usage of the script I introduced at the end may seem somewhat complex, contrary to the title of basic settings, but once applied, it can be very convenient to use.

## Reference

- [chezmoi](https://www.chezmoi.io/user-guide/command-overview/)
