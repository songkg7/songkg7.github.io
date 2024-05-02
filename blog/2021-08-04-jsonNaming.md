---
title: "@JsonNaming 사용 방법"
categories: [Java, SpringBoot]
date: 2021-08-04 12:17:00 +0900
tags: [java, json, json-naming]
authors: haril
---

API 에서 제공하는 json naming 방식과 어플리케이션 내의 naming 전략이 다를 경우가 있습니다.

```json
{
  "Title": "Frozen",
  "Year": "2013",
  "Type": "movie",
  "Poster": "https://m.media-amazon.com/images/M/MV5BMTQ1MjQwMTE5OF5BMl5BanBnXkFtZTgwNjk3MTcyMDE@._V1_SX300.jpg",
  "imdbID": "tt2294629"
}
```

```java
private String title;
private String year;
private String imdbId;
private String type;
private String poster;
```

변수명을 json key 와 일치시키지 않으면 데이터에 값이 들어가지 않습니다.

이 때 `@JsonProperty(value)`를 사용하면 프로젝트 안에서의 변수명을 바꾸지 않고 데이터를 매핑할 수 있습니다. 하지만 `@JsonProperty(value)`는 필드에 작성해야하므로 naming 전략이 다른 필드가 많다면 과하게 많은 어노테이션을 작성하게 되어 코드가 어노테이션으로 지저분해지겠죠.

바로 이럴 때 클래스레벨에 작성하여 클래스의 naming 전략을 한 번에 바꿀 수 있는 어노테이션이 바로 `@JsonNaming` 입니다.

## @JsonNaming

### before v2.12

아래처럼 깔끔하게 해결이 가능합니다.

```java
@Data
@JsonNaming(value = PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class Movie {

    private String title;
    private String year;

    @JsonProperty("imdbID")  // 필요한 부분에만!
    private String imdbId;
    private String type;
    private String poster;

}
```

![image](/img/jsonnaming1.webp)
_deprecated 되어 취소선이 표시된다_

하지만 jackson 2.12 버전부터 deprecated 된 방법이니 이왕이면 최신 방법을 알아보겠습니다.

### after v2.12

2.12 버전부터는 `PropertyNamingStrategies` 를 사용합니다.

```java
@JsonNaming(value = PropertyNamingStrategies.UpperCamelCaseStrategy.class)
```

내부 구현을 자세히 설명하면 너무 길어지고 주제에서 벗어나기 때문에 생략하지만 꽤나 흥미롭게 구현되어 있으니 살펴보시길 추천합니다!

:::info

변화된 내부 구현을 간단하게 설명하면 `NamingBase` 라는 추상 클래스가 기존 `PropertyNamingStrategy` 를 상속받고 있고, 다시 `NamingBase` 가 naming 전략에 상속되고 있다. `NamingBase` 를 일종의 중간 구현 클래스로 사용한다.
