---
title: "Exploring Kubernetes"
date: 2022-07-22 16:46:00 +0900
tags: [kubernetes, minikube, devops]
categories: [DevOps]
authors: haril
description: "This article explores Kubernetes Basics and how to use it with Docker Desktop."
---

## What is Kubernetes?

Kubernetes provides the following functionalities:

- Service discovery and load balancing
- Storage orchestration
- Automated rollouts and rollbacks
- Automated bin packing
- Automated scaling
- Secret and configuration management

For more detailed information, refer to the official documentation.

- [Kubernetes](https://kubernetes.io/ko/docs/concepts/overview/what-is-kubernetes/)

There are various ways to run Kubernetes, but the official site uses minikube for demonstration. This article focuses on utilizing Kubernetes using Docker Desktop. If you want to learn how to use minikube, refer to the official site.

Let's briefly touch on minikube.

## Minikube

### Install

```bash
brew install minikube
```

### Usage

The commands are intuitive and straightforward, requiring minimal explanation.

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
# Clean up resources after use
minikube delete --all
```

### Pros

Minikube is suitable for development purposes as it does not require detailed configurations like setting up secrets.

### Cons

One major drawback is that sometimes the command to view the dashboard causes hang-ups. This issue is the primary reason why I am not using minikube while writing this article.

## Docker Desktop

### Install

Simply activate Kubernetes from the Docker Desktop menu.

![enable](./enable-kube.webp)

### Dashboard

The Kubernetes dashboard is not enabled by default. You can activate it using the following command:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.0/aio/deploy/recommended.yaml
```

#### Starting the Dashboard

```bash
kubectl proxy
```

You can now access the dashboard via this [link](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/).

![dashboard](./dashboard-login.webp)

To log in, you will need a token. Let's see how to create one.

### Secrets

First, create a `kubernetes` folder to store related files separately.

```bash
mkdir kubernetes && cd kubernetes
```

:::warning

Granting admin privileges to the dashboard account can pose security risks, so be cautious when using it in actual operations.

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

#### Create Token

```bash
kubectl -n kubernetes-dashboard create token admin-user
```

```text
eyJhbGciOiJSUzI1NiIsImtpZCI6IjVjQjhWQVdpeWdLTlJYeXVKSUpxZndQUkoxdzU3eXFvM2dtMHJQZGY4TUkifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjox7jU4NTA3NTY1LCJpYXQiOjE2NTg1MDM5NjUsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW4lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsInNlcnZpY2VhY2NvdW55Ijp7Im5hbWUiOiJhZG1pbi11c2VyIiwidWlkIjoiZTRkODM5NjQtZWE2MC00ZWI0LTk1NDgtZjFjNWQ3YWM4ZGQ3In19LCJuYmYiOjE2NTg1MDM5NjUsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDphZG1pbi11c2VyIn1.RjoUaQnhTVKvzpAx_rToItI8HTZsr-6brMHWL63ca1_D4QIMCxU-zz7HFK04tCvOwyOTWw603XPDCv-ovjs1lM6A3tdgncqs8z1oTRamM4E-Sum8oi7cKnmVFSLjfLKqQxapBvZF5x-SxJ8Myla-izQxYkCtbWIlc6JfShxCSBJvfwSGW8c6kKdYdJv1QQdU1BfPY1sVz__cLNPA70_OpoosHevfVV86hsMvxCwVkNQHIpGlBX-NPog4nLY4gfuCMxKqjdVh8wLT7yS-E3sUJiXCcPJ2-BFSen4y-RIDbg18qbCtE3hQBr033Mfuly1Wc12UkU4bQeiF5SerODDn-g
```

Use the generated token to log in.

![welcome-view](./welcome.webp)
_Successful access!_

### Creating a Deployment

Create a deployment using an image. For this article, a web server using golang has been prepared in advance.

```bash
kubectl create deployment rest-server --image=songkg7/rest-server
```

As soon as the command is executed successfully, you can easily monitor the changes on the dashboard.

![create-deployment](./create-deployment.webp)
_The dashboard updates immediately upon deployment creation._

However, let's also learn how to check this via the CLI (the root...!).

#### Checking Status

```bash
kubectl get deployments
```

![get-deployment](./get-deployment.webp)

When a deployment is created, pods are also generated simultaneously.

```bash
kubectl get pods -o wide
```

![get-pods](./get-pods.webp)

Having confirmed that everything is running smoothly, let's send a request to our web server. Instead of using `curl`, we will use `httpie`[^footnote]. If you are more comfortable with `curl`, feel free to use it.

```bash
http localhost:8080/ping
```

![error](./http-error.webp)

Even though everything seems to be working fine, why can't we receive a response? 🤔

This is because our service is not exposed to the outside world yet. By default, Kubernetes pods can only communicate internally. Let's make our service accessible externally.

### Exposing the Service

```bash
kubectl expose deployment rest-server --type=LoadBalancer --port=8080
```

Since our service uses port 8080, we open this port. Using a different port may result in connection issues.

Now, try sending the request again.

```bash
http localhost:8080/ping
```

![200](./rest-server-200.webp)

You can see that you receive a successful response.

### Reference

- [Web UI Dashboard](https://kubernetes.io/ko/docs/tasks/access-application-cluster/web-ui-dashboard/)

---

[^footnote]: [Elegant httpie](https://songkg7.github.io/posts/httpie/)
