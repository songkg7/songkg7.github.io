---
title: AWS Lambda 와 TeamCity 로 배치 운영하기 1
date: 2022-04-11 20:35:00 +0900
tags: [aws-lambda, teamcity, spring-batch, event-driven-architecture]
categories: [Spring Batch]
img_path: /assets/img/teamcity
---

> Spring Batch 를 CI/CD tool 인 TeamCity 를 사용하여 운영하는 방법 및 AWS Lambda 를 통해 어떻게 더 개선할 수 있는지 연구한 내용을 공유합니다.

## 문제 인식

![비둘기](/%08%EA%B0%9C%EB%B0%9C%EC%9E%90%EB%A7%8C%20%EC%9D%B4%ED%95%B4%ED%95%98%EB%8A%94%20%EB%B9%84%EB%91%98%EA%B8%B0.webp)
_배치가 돌아가긴 하는데..._

제가 최근 본 프로젝트는 15분마다 `S3 bucket` 에 생성되는 파일을 가져와서 처리하고 새로 DB 에 저장하는 배치였습니다. 이 배치는 `Quartz` 의 `cron` 으로 1분마다 실행되며 S3 에 새로운 파일이 있는지 체크하고, 있다면 해당 파일을 처리하는 방식으로 되어 있습니다.

이러한 배치 설계는 **매우 비효율적**입니다.

이유는 다음과 같습니다.

1. S3 에 파일이 생성되는 시점을 배치가 알 수 없기 때문에 주기적으로(1분마다) 새로운 파일이 생성되었는지 체크한다.
2. 15분에 한 번 생성되는 파일을 처리하기 위해 14번을 실패해야만 한다. 파일이 제대로 생성되지 않고 스킵이라도 될 경우, 실패횟수는 더욱 늘어난다. 결국 **로그가 명확하지 않은 실패로 오염되어 진짜 에러 상황을 파악하기 힘들게 된다.**
3. 배치 실행 주기를 수정하기 위해서는 현재 동작 중인 배치를 종료하고, 재배포하는 과정이 필요하다.
4. 결국 시간과 리소스의 낭비로 이어진다.

과거 이런 방식밖에 없을 때에는 어쩔 수 없었겠지만 요즘은 충분히 더 좋은 설계가 가능합니다. 핵심만 설명하면 아래와 같습니다.

1. 스케쥴링을 외부로 분리하여 배치 실행 주기의 변경이 재배포로 이어지지 않게끔 한다. 가능하다면, 스케쥴링을 하지 않아도 배치 실행이 문제없도록 구현한다.
2. **Event-Driven Architecture**[^footnote] 를 적용하여 **S3 bucket 에 파일이 생성될 때만 배치를 실행**하게 한다.

그리고 이러한 배치 설계를 가능하게 하는 것이 바로 `TeamCity` 와 `AWS Lambda` 의 조합입니다.

지금부터 간단한 예시와 함께 어떻게 `TeamCity` 와 `AWS Lambda` 를 활용하면 좋을지 알아봅니다.

## TeamCity 설정

_설치방법은 여러 블로그에서 소개하고 있기 때문에 생략합니다._

`TeamCity` 에서 배치를 운영하기 위해서는 CI/CD 환경을 먼저 구성해야 합니다. `git push` 를 하면 자동으로 배포되고, 배포된 애플리케이션을 `TeamCity` 가 대신 실행해주는 일종의 파이프라인 방식으로 구성합니다.

> `TeamCity` 에선 Build 의 결과물로 생성된 `.jar` 등의 파일을 `Artifact` 라고 합니다.
{: .prompt-info}

### 1. Project 생성

`TeamCity` 에 로그인한 후, 메인 페이지 우측 상단의 `New project...` 를 눌러 프로젝트를 추가해줍니다.

![new project](/new%20project.webp)

 GitHub 연동을 진행하면 다음과 같은 창을 볼 수 있습니다. 원하는 Repository 를 선택합니다.

![github integration](/github%20integration.webp)

기본 설정은 `main` 브랜치를 감시하다가 변경사항이 발생할 경우 Repository 를 가져와서 `Build` 하도록 되어 있습니다. 저는 기본설정을 그대로 사용할 것이므로 Proceed 를 눌러줍니다.

![create project from url](/create%20project%20from%20url.webp)

### 2. Build Step 설정

저는 예제로 사용하는 sample batch 의 빌드툴로 `Gradle` 을 선택하였으므로 `Gradle Runner` 를 사용하여 빌드 단계를 구성하도록 하겠습니다. 기본값으로도 충분하므로 그대로 save 를 눌러주겠습니다. 만약 다른 빌드툴을 사용한다면 그에 맞게 구성해주면 됩니다.

![build step](/build%20step.webp)

### 3. General Settings

build 의 결과물인 **Artifact 가 저장될 경로를 설정**해줍니다. 이후 step 에서 해당 디렉토리의 `.jar` 파일을 실행시키게 됩니다.

![general settings](/general%20settings.webp)

> Artifact paths 의 경우 다양한 표현식을 사용하여 여러가지 경우를 대응할 수 있도록 커스텀이 가능합니다. 작성법은 링크[^fn-nth-2]를 참조해주세요.
{: .prompt-tip}

이후 프로젝트 타이틀을 클릭하여 프로젝트 설정으로 들어갑니다.

### 4. Build Configurations 추가

이제 실제로 배치를 실행시키는 설정을 추가하겠습니다. `Create build configuration` 을 눌러서 build 설정을 추가 후 `Build Step` 을 하나 추가합니다. Runner type 은 `Command Line` 으로 합니다.

![command line](/command%20line.webp)

`Working directory` 는 3번 과정에서 설정했던 `Artifact paths` 를 입력해주고, Run 은 `Custom script` 를 선택한 후 자신의 애플리케이션을 실행시킬 수 있는 스크립트를 입력합니다. 다 작성했다면 Save 를 누르고 왼쪽 목록 중 `Dependencies` 를 클릭하여 의존성 설정 창으로 이동합니다.

### 5. Dependencies

![artifact dependencies](/artifacto%20dependencies.webp)

`Snapshot Dependencies` 는 빌드 체인의 의존성 옵션을 설정합니다. 빌드가 실패한 경우엔 어떻게 할 것인지, 빌드가 성공할 경우만 실행할지 등등 다양한 옵션이 있으니 적당한 옵션을 선택해줍니다.

`Artifact Dependencies` 에서는 어떤 빌드의 `Artifacts` 를 사용할 것인지를 선택합니다. 우리는 앞선 빌드 과정에서 단 하나의 `Artifact` 만 생성될 것이므로 `*/**` 를 사용하여 모든 경로를 선택해도 무방합니다. 3번 과정에서 `Artifacts paths` 를 커스텀할 수 있었던 것처럼 필요하다면 특정 경로의 `Artifact` 만 사용하도록 설정할 수도 있습니다.

### 6. Run

![run](/run%20click.webp)

이제 빌드 체인 마지막 단계의 `Run` 버튼을 클릭해보면 의존하고 있는 빌드 스텝들이 순서대로 실행되면서 배치가 실행되는 것을 확인할 수 있습니다.

만약 특정 조건에서 실행되길 원한다면 `Trigger` Tab 에서 설정할 수 있습니다.

![trigger](/trigger.webp)

저는 빌드가 성공하면 자동으로 배치가 실행되게끔 `Finish Build Trigger` 와 매일 오전 3시에 배치가 실행될 수 있도록 `Schedule Trigger` 를 설정해봤습니다. 이 `Schedule Trigger` 는 코드레벨에서 설정해야했던 `Quartz Scheduler` 의 완벽한 상위호환(!)이라 배치의 재배포나 중단없이 자연스럽고 우아하게 스케쥴링이 가능하도록 도와줍니다.

다음 글에서는 `AWS Lambda` 설정을 통해 배치를 실행시키는 법을 알아보겠습니다.

---

## Reference

[TeamCity Docs](https://www.jetbrains.com/help/teamcity/teamcity-documentation.html)

---

[^footnote]: [Event-Driven Architecture](https://aws.amazon.com/ko/event-driven-architecture/)

[^fn-nth-2]: [Artifact Paths](https://www.jetbrains.com/help/teamcity/2021.2/configuring-general-settings.html#ConfiguringGeneralSettings-ArtifactPaths)
