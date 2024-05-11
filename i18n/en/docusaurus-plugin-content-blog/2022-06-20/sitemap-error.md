---
title: "Resolving 'Cannot Find sitemap.xml' Issue"
date: 2022-06-20 20:11:00 +0900
tags: [google-search-console, sitemap]
categories: [ETC]
authors: haril
---

I had registered the `sitemap.xml` for my blog to ensure it gets indexed by Google, but all I was getting was an error message saying 'sitemap not found'. Finally, I managed to resolve it, and I am sharing the method I used.

While this method may not solve every case, it seems worth a try.

Simply run the following command:

```bash
curl https://www.google.com/ping\?sitemap\={path to your submitted sitemap}
```

And then, when you check the search console again...!

![sitemap-success](./sitemap-success.webp)
_Finally resolved after almost a month...ㅠㅠ_

The sitemap is finally being recognized.

Hope this helps!

### Reference

- [sitemap.org](https://www.sitemaps.org/protocol.html#submit_ping)

- [google developers docs](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap?hl=ko)