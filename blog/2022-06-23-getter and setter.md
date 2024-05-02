---
title: getter/setter 에 대한 사실과 오해
date: 2022-06-23 10:22:00 +0900
tags: [java, getter, setter, oop, encapsulation]
categories: [Java]
---

구글에 `getter/setter` 에 대해 검색해보면 정말 많은 게시글이 나온다. 대부분 `getter/setter` 를 사용하는 이유에 대해서 작성되어 있고 그 이유 중 하나로 캡슐화, 정보 은닉 같은 키워드를 중심으로 설명하고 있다.

필드 변수를 `private` 로 선언하여 외부에서 접근을 막고 `getter/setter` 만 공개하여 캡슐화한다는 설명이 90%는 되는 것 같다.

하지만 `getter/setter` 를 쓰면 진짜로 캡슐화가 될까?

결론부터 말하자면 **`getter/setter` 는 캡슐화를 전혀 달성할 수 없다.** 캡슐화를 하고 싶다면 getter, setter 는 쓰지 말아야한다는 것이다. 이걸 이해하기 위해서는 먼저 캡슐화에 대해 정확히 이해할 필요가 있다.

## 캡슐화(encapsulation)란 무엇인가

> 캡슐화(영어: encapsulation)는 객체 지향 프로그래밍에서 다음 2가지 측면이 있다: 객체의 속성(data fields)과 행위(메서드, methods)를 하나로 묶고, 실제 구현 내용 일부를 내부에 감추어 은닉한다. - 위키백과

**캡슐화한다는 것은 외부에서 객체 내부에 어떤 속성이 있는지 완벽하게 알지 못해야 한다는 것**이다.

## getter, setter 가 캡슐화를 하지 못하는 이유

위에서 알아본 바에 의하면 분명히 캡슐화란 외부에서 객체 내부에 어떤 속성이 있는지 알지 못해야하는데 `getter/setter` 는 특정 필드가 있다는 사실을 외부에 노골적으로 공개한다. 다음의 예시를 보자.

### Example

```java
public class Student {

    private String name;
    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String introduce() {
        return String.format("제 이름은 %s 이고 나이는 %d 입니다.", name, age);
    }
}
```

```java
class StudentTest {

    @Test
    void student() {
        Student student = new Student();
        student.setName("John");
        student.setAge(20);
        String introduce = student.introduce();

        assertThat(student.getName()).isEqualTo("John");
        assertThat(student.getAge()).isEqualTo(20);
        assertThat(introduce).isEqualTo("제 이름은 John 이고 나이는 20 입니다.");
    }
}
```

`Student` 외부에서도 내부에 `name` 과 `age` 라는 속성을 갖고 있다는 것을 알 수 있는데 이 상태를 캡슐화되어 있는 상태라고 말할 수 있을까?

만약 `Student` 의 `age` 속성이 없어진다면 `getter/setter` 를 사용하고 있는 모든 곳에서 변경이 발생한다. 강한 결합이 생기는 것이다.

진정한 의미의 캡슐화는 public interface 를 제외한 객체 내부의 수정이 외부에 어떤 영향도 주지 못해야 한다.

내부 구현을 모르도록 구현을 변경해보자.

```java
public class Student {

    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String introduce() {
        return String.format("제 이름은 %s 이고 나이는 %d 입니다.", name, age);
    }
}
```

```java
class StudentTest {

    @Test
    void student() {
        Student student = new Student("John", 20);
        String introduce = student.introduce();

        assertThat(introduce).isEqualTo("제 이름은 John 이고 나이는 20 입니다.");
    }
}
```

이제 객체는 내부 구현을 public interface 를 통해 노출하지 않는다. 어떤 데이터를 가지고 있는지도 알 수 없고, 수정되지도 않으며 오로지 메세지를 주고 받을 수만 있게 되었다.

## Conclusion

캡슐화는 객체지향 관점에서 외부에 의존적이지 않은 설계를 구상할 때 필수적으로 언급되는 주제다. 구현에 따라서 캡슐화의 수준이 달라지기 때문에 '`getter` 와 `setter` 모두 쓰지 말아야한다' 는 의견과 '`getter` 정도는 허용해도 괜찮다' 는 의견이 팽팽하게 대립해왔다.

개인적으로는 `getter` 도 쓰지 말아야한다고 생각하며 사용을 최대한 지양하는 편이지만, 테스트 관점에서는 `getter` 또는 `setter` 가 존재해야 테스트 코드를 작성하기 편할 때도 분명히 있기 때문에 어느 수준의 캡슐화를 해야하는지는 현재 처한 상황과 개발하는 코드의 목적에 맞춰서 판단할 일이다.

좋은 설계는 언제나 트레이드오프(trade-off)의 과정 속에서 구체화된다.

> 모든 예제 코드는 [GitHub](https://github.com/songkg7/java-practice/blob/main/basic-syntax/src/main/java/basicsyntax/getterandsetter/Student.java)에 있습니다.
{: .prompt-info}
