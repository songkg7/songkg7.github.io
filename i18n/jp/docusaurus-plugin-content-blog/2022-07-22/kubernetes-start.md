---
title: "Kubernetesを探る"
date: 2022-07-22 16:46:00 +0900
tags: [kubernetes, minikube, devops]
categories: [DevOps]
authors: haril
description: "この記事では、Kubernetesの基本とDocker Desktopを使った利用方法について探ります。"
---

## Kubernetesとは？

Kubernetesは以下の機能を提供します：

- サービスディスカバリとロードバランシング
- ストレージオーケストレーション
- 自動ロールアウトとロールバック
- 自動ビンパッキング
- 自動スケーリング
- シークレットと設定管理

詳細については公式ドキュメントを参照してください。

- [Kubernetes](https://kubernetes.io/ko/docs/concepts/overview/what-is-kubernetes/)

Kubernetesを実行する方法はいくつかありますが、公式サイトではデモンストレーションにminikubeを使用しています。この記事では、Docker Desktopを使ったKubernetesの利用に焦点を当てます。minikubeの使い方を学びたい場合は、公式サイトを参照してください。

では、minikubeについて簡単に触れてみましょう。

## Minikube

### インストール

```bash
brew install minikube
```

### 使用方法

コマンドは直感的でシンプルなので、説明はほとんど不要です。

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
# 使用後のリソースをクリーンアップ
minikube delete --all
```

### 利点

minikubeは、シークレットの設定などの詳細な設定が不要なため、開発目的に適しています。

### 欠点

一つの大きな欠点は、ダッシュボードを表示するコマンドがハングアップすることがある点です。この問題が主な理由で、この記事を書く際にはminikubeを使用していません。

## Docker Desktop

### インストール

Docker DesktopのメニューからKubernetesを有効にするだけです。

![enable](./enable-kube.webp)

### ダッシュボード

Kubernetesダッシュボードはデフォルトでは有効になっていません。以下のコマンドで有効にできます：

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.0/aio/deploy/recommended.yaml
```

#### ダッシュボードの起動

```bash
kubectl proxy
```

この[リンク](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/)からダッシュボードにアクセスできます。

![dashboard](./dashboard-login.webp)

ログインするにはトークンが必要です。トークンの作成方法を見てみましょう。

### シークレット

まず、関連ファイルを別々に保存するために`kubernetes`フォルダを作成します。

```bash
mkdir kubernetes && cd kubernetes
```

:::warning

ダッシュボードアカウントに管理者権限を付与することはセキュリティリスクを伴うため、実際の運用で使用する際には注意が必要です。

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

#### トークンの作成

```bash
kubectl -n kubernetes-dashboard create token admin-user
```

```text
eyJhbGciOiJSUzI1NiIsImtpZCI6IjVjQjhWQVdpeWdLTlJYeXVKSUpxZndQUkoxdzU3eXFvM2dtMHJQZGY4TUkifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjox7jU4NTA3NTY1LCJpYXQiOjE2NTg1MDM5NjUsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW4lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsInNlcnZpY2VhY2NvdW55Ijp7Im5hbWUiOiJhZG1pbi11c2VyIiwidWlkIjoiZTRkODM5NjQtZWE2MC00ZWI0LTk1NDgtZjFjNWQ3YWM4ZGQ3In19LCJuYmYiOjE2NTg1MDM5NjUsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDphZG1pbi11c2VyIn1.RjoUaQnhTVKvzpAx_rToItI8HTZsr-6brMHWL63ca1_D4QIMCxU-zz7HFK04tCvOwyOTWw603XPDCv-ovjs1lM6A3tdgncqs8z1oTRamM4E-Sum8oi7cKnmVFSLjfLKqQxapBvZF5x-SxJ8Myla-izQxYkCtbWIlc6JfShxCSBJvfwSGW8c6kKdYdJv1QQdU1BfPY1sVz__cLNPA70_OpoosHevfVV86hsMvxCwVkNQHIpGlBX-NPog4nLY4gfuCMxKqjdVh8wLT7yS-E3sUJiXCcPJ2-BFSen4y-RIDbg18qbCtE3hQBr033Mfuly1Wc12UkU4bQeiF5SerODDn-g
```

生成されたトークンを使用してログインします。

![welcome-view](./welcome.webp)
_アクセス成功！_

### デプロイメントの作成

イメージを使用してデプロイメントを作成します。この記事では、事前に準備されたgolangを使用したウェブサーバーを使用します。

```bash
kubectl create deployment rest-server --image=songkg7/rest-server
```

コマンドが正常に実行されると、ダッシュボードでの変更を簡単に監視できます。

![create-deployment](./create-deployment.webp)
_デプロイメント作成後、ダッシュボードが即座に更新されます。_

しかし、CLIを使用してこれを確認する方法も学びましょう（根本的な方法です...！）。

#### ステータスの確認

```bash
kubectl get deployments
```

![get-deployment](./get-deployment.webp)

デプロイメントが作成されると、ポッドも同時に生成されます。

```bash
kubectl get pods -o wide
```

![get-pods](./get-pods.webp)

すべてが正常に動作していることを確認したら、ウェブサーバーにリクエストを送信してみましょう。`curl`の代わりに`httpie`[^footnote]を使用します。`curl`に慣れている場合は、それを使用しても構いません。

```bash
http localhost:8080/ping
```

![error](./http-error.webp)

すべてが正常に動作しているように見えるのに、なぜ応答を受け取れないのでしょうか？ 🤔

これは、サービスがまだ外部に公開されていないためです。デフォルトでは、Kubernetesのポッドは内部でのみ通信できます。サービスを外部に公開しましょう。

### サービスの公開

```bash
kubectl expose deployment rest-server --type=LoadBalancer --port=8080
```

サービスがポート8080を使用しているため、このポートを開きます。異なるポートを使用すると接続に問題が生じる可能性があります。

では、再度リクエストを送信してみましょう。

```bash
http localhost:8080/ping
```

![200](./rest-server-200.webp)

成功した応答を受け取ることができます。

### 参考資料

- [Web UI ダッシュボード](https://kubernetes.io/ko/docs/tasks/access-application-cluster/web-ui-dashboard/)

---

[^footnote]: [Elegant httpie](https://haril.dev/jp/blog/2022/06/25/httpie)
