---
title: AWS Lambda 와 TeamCity 로 배치 운영하기 2
date: 2022-04-12 20:35:00 +0900
tags: [aws-lambda, teamcity, spring-batch, event-driven-architecture]
categories: [Spring Batch]
---

> 이 게시글은 개발 중 삽질한 내용을 바탕으로 정리하고 있으므로, 어느정도 사실과 다른 내용이 있을 수 있습니다. 관련 피드백은 언제나 환영합니다.
{: .prompt-info}

- _[AWS Lambda 와 TeamCity 로 배치 운영하기 1](https://songkg7.github.io/posts/teamcitylambda1/)_

지난 게시글에서는 배치 운영을 위한 최소한의 TeamCity 설정을 진행해봤습니다. 이번에는 `Event-Driven Architecture` 구현의 핵심적인 역할을 해주는 AWS Lambda 를 설정하는 방법을 알아보겠습니다.

## AWS Lambda

AWS Lambda 는 S3 Event trigger 를 설정할 수 있는 기능을 제공합니다. 여기서 **Event 란 객체(S3에 저장된 파일)의 생성 및 삭제 등, S3 에서 발생하는 주요 활동**을 의미합니다.

![event-driven](/assets/img/teamcity/event-driven.webp)
_Event-Driven Architecture 를 팀원들에게 소개하며 그린 그림_

Event trigger 를 이용해 함수를 실행시키면 특정 조건에서 함수가 실행되도록 구성할 수 있습니다.

TeamCity 는 Build 의 실행을 원격으로 컨트롤할 수 있도록 REST API 를 제공하고 있으니, S3 bucket 에 객체가 생성될 때 Lambda 함수가 트리거되도록 구성하면 **처리해야할 객체가 생성되었을 경우에만 배치가 실행되도록 구성**할 수 있습니다.

Amazon S3 설정이나 AWS Lambda 함수를 생성하는 법은 자세히 설명된 공식 문서[^footnote]가 있으므로 생략하고 바로 Lambda 코드를 작성해보겠습니다.

### AWS Lambda 에서 TeamCity 로 POST 요청 보내기

TeamCity 는 특정 POST 요청을 받으면 Build 를 실행시킵니다.

아래 코드는 AWS 에서 제공하는 python template 을 약간 수정하여 HTTP 요청을 보낼 수 있도록 한 코드입니다.

```python
import urllib3 # 1.
import urllib.parse
import json
import boto3


def lambda_handler(event, context):
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')

    try:
        body = json.dumps(
            {
                "buildType": {
                    "id": "SampleSpringBatch_SampleJob" # 2.
                },
                "comment": {
                    "text": "Executed by AWS Lambda."
                },
                "properties": {
                    "property": [{
                        "name": "eventKey",
                        "value": key
                    }]
                }
            }
        )

        http = urllib3.PoolManager()
        response = http.request("POST",
                                "{TeamCity URL}/app/rest/buildQueue", # 3.
                                headers={
                                    "Accept": "application/json",
                                    "Authorization": "{TeamCity authorization token}", # 4.
                                    "Content-Type": "application/json"
                                },
                                body=body)
        return response.status
    except Exception as e:
        print(e)
        print("Error Lambda function")
        raise e

```

1. `urllib` 가 제대로 동작하지 않는 이슈가 있어서 `urllib3` 를 사용했습니다.
2. 실행시키고 싶은 `Build Configuration` 의 ID 값을 넣어줍니다. 해당 빌드의 `General Settings` 에서 해당 값을 찾을 수 있습니다.
3. TeamCity 가 실행되고 있는 Server address 를 넣어줍니다.
4. TeamCity `User Profile` 의 `Access Tokens` Tab 에서 발급받을 수 있는 토큰을 넣어줍니다. 해당 유저의 권한으로 빌드가 실행됩니다.

비교적 가독성이 좋은 Python 이므로 코드를 이해하는데에는 큰 어려움이 없으시리라 생각합니다.

> 자세한 TeamCity API 사용법은 [링크](https://www.jetbrains.com/help/teamcity/rest/start-and-cancel-builds.html) 를 참조해주세요.
{: .prompt-info}

### Lambda 에 의해 Build 가 실행되는지 확인

이제 S3 에 파일을 몇개 업로드해보면 S3 trigger 에 의해 AWS Lambda 가 동작하게 되고, TeamCity Build 가 Lambda 가 보낸 요청을 받아서 처리하는 모습을 확인할 수 있습니다.

![executed by aws lambda](/assets/img/teamcity/executed%20by%20lambda.webp)
_AWS Lambda 에 의해 배치가 실행된다._

## 정리

1편과 2편을 통해 스케쥴링을 통해 실행되는 배치를 어떻게 Event-Driven 으로 개선해나갈 수 있는지 확인해봤습니다.

1. TeamCity 를 사용해서 스케쥴링을 외부에서 컨트롤할 수 있게 하여 유연성을 증가시켰고,
2. AWS Lambda 를 사용하여 시간이 아닌 객체의 생성에 초점을 맞추어 배치가 동작할 수 있게끔 했습니다.

실제 운영에 적용하려면 네트워크 방화벽이나 https 적용, Clean Role 설정, ELK 로 로그 전송하기 등 넘어야할 산이 몇 개 더 있지만, 이후 내용은 다른 게시글에서 다뤄보겠습니다.

긴 글 읽어주셔서 감사합니다.

---

## Reference

[TeamCity REST API](https://www.jetbrains.com/help/teamcity/rest/start-and-cancel-builds.html)

---

[^footnote]: [Amazon S3 trigger 를 사용하여 Lambda 함수 호출하기](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/with-s3-example.html)
