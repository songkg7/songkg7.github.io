---
title: Managing Environment Variables with AWS S3 and Automation
date: 2024-03-16 17:56:45 +0900
aliases:
tags:
    - cli
    - bash
    - automation
    - s3
categories:
image: /img/banner/aws-banner.png
updated: 2024-03-16 18:05:53 +0900
authors: haril
---

## Situation

-   As the codebase grows, the number of configuration values required for running a Spring application is increasing.
-   While most situations are validated with test code, there are times when testing with `bootRun` locally is necessary.

## Complication

-   Want to separate configuration values into environment variables for better management.
-   `.env` files are typically ignored in Git, making version tracking difficult and prone to fragmentation.
    -   Need a way to synchronize files across multiple machines.

## Question

-   Is there a convenient method that minimizes friction among developers and is easy to apply?
    -   Preferably a familiar method for easier maintenance.
-   Can the version of `.env` files be managed?
-   Is the learning curve low?
    -   Want to avoid a situation where the solution is more complex than the problem.
-   Can it be applied directly to the production environment?

## Answer

### AWS S3

-   Updating `.env` files is convenient with AWS CLI.
-   Version control of `.env` files can be done through snapshots.
-   AWS S3 is a service familiar to most developers and has a low learning curve.
-   In the AWS ECS production environment, system variables can be directly applied using S3 ARNs.

![](https://i.imgur.com/Gs01GRA.gif)

.

..

...

....

## Is that all?

If that's it, the article might seem a bit dull, right? Of course, there are still a few issues remaining.

### Which Bucket is it in?

When using S3, it's common to end up with many buckets due to file structure optimization or business-specific categorization.

```bash
aws s3 cp s3://something.service.com/enviroment/.env .env
```

If the `.env` file is missing, you'll need to download it using AWS CLI as shown above. Without someone sharing the bucket with you in advance, you might have to search through all buckets to find the environment variable file, which could be inconvenient. The intention was to avoid sharing, but having to receive something to share again might feel a bit cumbersome.

![](https://i.imgur.com/zoRtk5z.png)
_Too many buckets. Where's the env...?_

Automating the process of exploring buckets in S3 to find and download the necessary `.env` file would make things much easier. This can be achieved by writing a script using tools like fzf or gum.

### Spring Boot Requires System Environment Variables, Not `.env`...

Some of you may have already noticed that Spring Boot reads system environment variables to fill in placeholders in YAML files. However, using just the `.env` file won't apply the system environment variables, thus not being picked up during Spring Boot's initialization process.

Let's briefly look at how it works.

```bash
# .env
HELLO=WORLD
```

```yaml
# application.yml
something:
    hello: ${HELLO} # Retrieves the value from the HELLO environment variable on the OS.
```

```java
@Slf4j
@Component
public class HelloWorld {

    @Value("${something.hello}")
    private String hello;

    @PostConstruct
    public void init() {
        log.info("Hello: {}", hello);
    }
}
```

![](https://i.imgur.com/2xsaxSq.png)
_SystemEnvironmentPropertySource.java_

![](https://i.imgur.com/ht8Wkin.png)

You can see that the placeholder in `@Value` is not resolved, causing the bean registration to fail and resulting in an error.

![](https://i.imgur.com/5hiC2wG.gif)
_Just having a `.env` file doesn't register it as a system environment variable._

To apply the `.env` file, you can either run the `export` command or register the `.env` file in IntelliJ's run configurations. However, using the `export` command to register too many variables globally on your local machine can lead to unintended behavior like overwriting, so it's recommended to manage them individually through IntelliJ's GUI.

![](https://i.imgur.com/qyTR7Vb.png)
_IntelliJ supports configuring `.env` files via GUI._

![](https://i.imgur.com/9Ef45h1.png)
_The placeholder is resolved and applied correctly._

## Final Answer - The Real Final One

Phew, the long process of problem identification and scoping has come to an end. Let's summarize the workflow once more and introduce a script.

1. Use an automation script to find and download the appropriate `.env` from S3.
2. Set the `.env` as system environment variables.

The shell script is written to be simple yet stylized using [gum](https://github.com/charmbracelet/gum).

[Full Code](https://github.com/songkg7/automation-script)

```bash
#!/bin/bash

S3_BUCKET=$(aws s3 ls | awk '{print $3}' | gum filter --reverse --placeholder "Select...") # 1.

# Choose deployment environment
TARGET=$(gum choose --header "Select a environment" "Elastic Container Service" "EC2")
if [ "$TARGET" = "Elastic Container Service" ]; then
    TARGET="ecs"
else
    TARGET="ec2"
fi

S3_BUCKET_PATH=s3://$S3_BUCKET/$TARGET/

# Search for the env file
ENV_FILE=$(aws s3 ls "$S3_BUCKET_PATH" | grep env | awk '{print $4}' | gum filter --reverse --placeholder "Select...") # 2.

# Confirm
if (gum confirm "Are you sure you want to use $ENV_FILE?"); then
    echo "You selected $ENV_FILE"
else
    die "Aborted."
fi

ENV_FILE_NAME=$(gum input --prompt.foreground "#04B575" --prompt "Enter the name of the env file: " --value ".env" --placeholder ".env")
gum spin -s meter --title "Copying env file..." -- aws s3 cp "$S3_BUCKET_PATH$ENV_FILE" "$ENV_FILE_NAME" # 3.

echo "Done."
```

1. Use `gum filter` to select the desired S3 bucket.
2. Search for items containing the word `env` and assign it to a variable named `ENV_FILE`.
3. Finalize the object key of the `.env` file and proceed with the download.

I've created a demo video of the execution process.

![](https://i.imgur.com/CWSYRCu.gif)
_Demo_

After this, you just need to apply the `.env` file copied to the current directory to IntelliJ as mentioned earlier.

:::tip

Using [direnv](https://direnv.net/) and IntelliJ's direnv plugin can make the application even more convenient.

:::

![](https://i.imgur.com/NSIiPwn.jpeg)

## Conclusion

-   The script is easy to maintain due to its simplicity.
-   Team response has been very positive.
-   Developers appreciate aesthetics.
-   For sensitive credentials, consider using AWS Secret Manager.