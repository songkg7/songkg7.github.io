---
sidebar_position: 4
---

# Syntax

:::caution

**WIP**

:::

O2 supports the following syntax conversion.

## Wiki link

Obsidian's wiki link is converted to a simple link.

**AS-IS**

```md
[[What is Obsidian?]]
```

**TO-BE**

```md
[What is Obsidian?](/What%20is%20Obsidian%3F)
```

## Image

Obsidian's image syntax is converted to Jekyll's image syntax.

**AS-IS**

```md
![[NewJeans.png]]
```

**TO-BE**

```md
![image](/assets/img/<yyyy-MM-dd>-<title>/NewJeans.png)
```

`yyyy-MM-dd` is replaced by the date of converting.

## Resize image

Obsidian's resize image syntax is converted to Jekyll's resize image syntax.

**AS-IS**

```md
![[NewJeans.png|100]]
```

**TO-BE**

```md
![image](/assets/img/<yyyy-MM-dd>-<title>/NewJeans.png){: width="100" }
```

## Resize image (width & height)

Obsidian's resize image syntax is converted to Jekyll's resize image syntax.

**AS-IS**

```md
![[NewJeans.png|100x200]]
```

**TO-BE**

```md
![image](/assets/img/<yyyy-MM-dd>-<title>/NewJeans.png){: width="100" height="200" }
```

## Embeds

Obsidian's embeds syntax is converted to a simple link.

**AS-IS**

```md
![[Obsidian#This is Obsidian!]]
```

**TO-BE**

```md
[Obsidian](/Obsidian#This%20is%20Obsidian!)
```

## Comments

Obsidian's comments syntax is converted to Jekyll's comments syntax.

**AS-IS**

```md
%% This is a comment %%
```

**TO-BE**

```md
<!-- This is a comment -->
```

## Footnotes

Obsidian's footnotes syntax is converted to Jekyll's footnotes syntax.

**AS-IS**

```md
[^1]
```

**TO-BE**

```md
[^fn-nth-1]
```

Currently, only supports the simple syntax.

## Curly braces

Obsidian's curly braces syntax is converted to Jekyll's curly braces syntax.

**AS-IS**

```md
{{ content }}
```

**TO-BE**

```md
{% raw %}{{ content }}{% endraw %}
```

Optional

## Others

Grammars not in the table are ignored. If there is a syntax you would like to convert, please let me know in an
issue.

## References

- [Obsidian](https://obsidian.md/)
- [Jekyll](https://jekyllrb.com/)
