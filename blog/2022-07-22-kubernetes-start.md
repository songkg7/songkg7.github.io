---
title: "[Kubernetes] 쿠버네티스 훑어보기"
date: 2022-07-22 16:46:00 +0900
tags: [kubernetes, minikube, devops]
categories: [DevOps]
---

## What is kubernetes?

쿠버네티스는 다음을 기능들을 제공한다.

- 서비스 디스커버리와 로드 밸런싱
- 스토리지 오케스트레이션
- 자동화된 롤아웃과 롤백
- 자동화된 빈 패킹
- 자동화된 복구
- 시크릿과 구성 관리

자세한 정보는 공식 문서에서 잘 설명해주니 공식 문서를 참조하자.

- [kubernetes](https://kubernetes.io/ko/docs/concepts/overview/what-is-kubernetes/)

쿠버네티스를 실행할 수 있는 방법에는 여러가지가 있지만 공식 사이트에서는 minikube 를 사용하여 진행한다.
이 글에서는 Docker desktop 을 사용하여 쿠버네티스를 활용하는 방법을 정리하고 있다.
minikube 를 사용하는 방법을 알고 싶다면, 공식 사이트를 참고하시면 되겠다.

minikube 는 일단 간단하게 짚어보고 넘어가자.

## minikube

### Install

```bash
brew install minikube
```

### Usage

사용 방법 설명이 필요없을 정도로 명령어가 직관적이다.

```bash
minikube start
```

```bash
minikube dashboard
```

```bash
minikube stop
```

```bash
# 사용이 끝난 리소스 정리
minikube delete --all
```

### 장점

Secret 등 세부설정이 필요하지 않고 간단하게 개발 용도로 쓰기에 적합하다.

### 단점

dashboard 를 보기 위한 명령어를 실행하면 가끔씩 hang 이 걸려버리는 문제가 있다.
사실 이게 가장 큰 이유고 이 글을 쓰면서 minikube 를 사용하지 않는 이유이기도 하다.

## Docker desktop

### Install

Docker desktop 의 메뉴에서 kubernetes 를 활성화해주면 끝.

![enable](/assets/img/kubernetes/enable-kube.webp)

### Dashboard

쿠버네티스 대쉬보드는 기본적으로 활성화되어 있지 않다.

다음 명령어를 통해 활성화할 수 있다.

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.0/aio/deploy/recommended.yaml
```

#### Dashboard start

```bash
kubectl proxy
```

이제 <http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/> 를 통해 dashboard 에 접근할 수 있다.

![dashboard](/assets/img/kubernetes/dashboard-login.webp)

로그인을 위해 token 이 필요하다. 다음은 생성 방법을 확인해보자.

### Secrets

우선 관련 파일을 따로 보관하기 위해서 `kubernetes` 폴더를 만들어준다.

```bash
mkdir kubernetes && cd kubernetes
```

> 이 챕터에서 생성되는 토큰은 admin 권한을 가지게 된다. dashboard 계정이 admin 권한을 갖는 것은 보안상 위험할 수 있으므로 실제 운영시에는 본인의 행동을 명확하게 인지해야 한다.
{: .prompt-warning }

#### dashboard-adminuser.yaml

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
```

```bash
kubectl apply -f dashboard-adminuser.yaml
```

#### cluster-role-binding.yml

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

```bash
kubectl apply -f cluster-role-binding.yaml
```

#### create token

```bash
kubectl -n kubernetes-dashboard create token admin-user
```

```text
eyJhbGciOiJSUzI1NiIsImtpZCI6IjVjQjhWQVdpeWdLTlJYeXVKSUpxZndQUkoxdzU3eXFvM2dtMHJQZGY4TUkifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjox7jU4NTA3NTY1LCJpYXQiOjE2NTg1MDM5NjUsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW4lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsInNlcnZpY2VhY2NvdW55Ijp7Im5hbWUiOiJhZG1pbi11c2VyIiwidWlkIjoiZTRkODM5NjQtZWE2MC00ZWI0LTk1NDgtZjFjNWQ3YWM4ZGQ3In19LCJuYmYiOjE2NTg1MDM5NjUsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDphZG1pbi11c2VyIn1.RjoUaQnhTVKvzpAx_rToItI8HTZsr-6brMHWL63ca1_D4QIMCxU-zz7HFK04tCvOwyOTWw603XPDCv-ovjs1lM6A3tdgncqs8z1oTRamM4E-Sum8oi7cKnmVFSLjfLKqQxapBvZF5x-SxJ8Myla-izQxYkCtbWIlc6JfShxCSBJvfwSGW8c6kKdYdJv1QQdU1BfPY1sVz__cLNPA70_OpoosHevfVV86hsMvxCwVkNQHIpGlBX-NPog4nLY4gfuCMxKqjdVh8wLT7yS-E3sUJiXCcPJ2-BFSen4y-RIDbg18qbCtE3hQBr033Mfuly1Wc12UkU4bQeiF5SerODDn-g
```

생성된 token 을 사용하여 로그인한다.

![welcome-view](/assets/img/kubernetes/welcome.webp)
_접속 성공!_

### deployment 생성

image 를 사용하여 deployment 를 생성한다. 이 글을 위해 golang 을 사용한 웹서버를 미리 만들어놨다.

```bash
kubectl create deployment rest-server --image=songkg7/rest-server
```

명령이 성공적으로 수행되면 dashboard 에 바로 변화가 생기기 때문에 쉽게 모니터링할 수 있다.

![create-deployment](/assets/img/kubernetes/create-deployment.webp)
_deployment 를 생성하면 dashboard 에 바로 변화가 생긴다._

하지만 CLI(근본...!) 를 통해서 확인하는 법 또한 알아보자.

#### 상태 확인

```bash
kubectl get deployments
```

![get-deployment](/assets/img/kubernetes/get-deployment.webp)

deployment 의 생성과 동시에 pod 또한 생성된다.

```bash
kubectl get pods -o wide
```

![get-pods](/assets/img/kubernetes/get-pods.webp)

정상적으로 실행되고 있음을 확인했으니 이제 우리의 웹서버에 요청을 보내보자.
명령은 `curl` 대신 `httpie`[^footnote] 를 사용하는데, `curl` 이 더 익숙하다면 `curl` 을 사용해도 무방하다.

```bash
http localhost:8080/ping
```

![error](/assets/img/kubernetes/http-error.webp)

분명히 정상동작 중인데 왜 응답을 받을 수 없을까? 🤔

아직 우리 서비스는 외부에 노출되어 있지 않기 때문이다. 쿠버네티스의 pods 는 기본적으로 내부에서만 통신이 가능하다. 이제 우리 서비스를 외부와 통신이 가능하도록 변경해보자.

### service 외부 노출

```bash
kubectl expose deployment rest-server --type=LoadBalancer --port=8080
```

우리 서비스는 8080 을 사용하고 있기 때문에 8080 port 를 열어준다. 다른 포트를 사용하면 접속되지 않을 수 있다.

이제 다시 요청을 보내보자.

```bash
http localhost:8080/ping
```

![200](/assets/img/kubernetes/rest-server-200.webp)

성공적으로 응답을 받을 수 있는 것을 확인할 수 있다.

### Reference

- <https://kubernetes.io/ko/docs/tasks/access-application-cluster/web-ui-dashboard/>

---

[^footnote]: [우아한 httpie](https://songkg7.github.io/posts/httpie/)
