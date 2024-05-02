---
title: "'sitemap.xml 을 찾을 수 없습니다' 해결하기"
date: 2022-06-20 20:11:00 +0900
tags: [google-search-console, sitemap]
categories: [ETC]
---

블로그 글이 구글에 노출될 수 있도록 `sitemap.xml` 을 등록했으나, '사이트맵을 찾을 수 없음' 이라는 에러 메세지만 휑하게 나왔었는데 드디어 해결하게 되어 제가 사용한 방법을 공유합니다.

이 방법이 모든 케이스를 해결해주진 못하겠지만, 시도해볼 가치는 있는 것 같습니다.

아래 명령어를 실행해줍니다.

```bash
curl https://www.google.com/ping\?sitemap\={제출하고자 하는 sitemap 의 경로}
```

그리고 다시 search console 에 접속해보면...!

![sitemap-success](/assets/img/sitemaperror/sitemap-success.webp)
_근 한달만에 겨우 해결...ㅠㅠ_

드디어 sitemap 을 인식하네요.

도움되시길 바랍니다!

### Reference

- [sitemap.org](https://www.sitemaps.org/protocol.html#submit_ping)

- [google developers docs](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap?hl=ko)
