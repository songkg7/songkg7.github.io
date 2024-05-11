This article discusses how many concurrent requests a single server application can handle. By adjusting settings like `max-connections`, `accept-count`, and `threads.max`, the author was able to test the application's capacity. The tests revealed that with appropriate settings, the application could handle up to 15,000 concurrent users without errors. The article also explains the relationship between these settings and the application's ability to accept and process connections.

The code used in the article can be found on GitHub at [test-script](https://github.com/songkg7/spike-test) and [sample-server](https://github.com/songkg7/sample-server).

:::

## Uncovered Topics

The following are lists of topics that were organized while writing this article but are somewhat off-topic or deemed worthy of separate discussion:

- Connecting to EC2 via SSM, how to use ECR, setting up SSO with AWS Identity Center
- Resolving "allocate memory error" by increasing server-side memory or setting up swap memory
- Investigating the causes of i/o timeouts
- Understanding the differences and operational flows between BIO Connector and NIO Connector
- Exploring the similarities and relationships between connections, sockets, and ports in simultaneous user access

## Reference

- [Visualizing load testing with Grafana K6](https://velog.io/@heka1024/Grafana-k6%EC%9C%BC%EB%A1%9C-%EB%B6%80%ED%95%98-%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EA%B8%B0)
- [K6 spike test](https://k6.io/docs/test-types/spike-testing/)
- [100k_concurrent_server](https://shdkej.com/blog/100k_concurrent_server/)
- [spring-boot-configure-tomcat](https://www.baeldung.com/spring-boot-configure-tomcat)
- [https://junuuu.tistory.com/835](https://junuuu.tistory.com/835)
- [Understanding NIO Connector and BIO Connector](https://velog.io/@cjh8746/%EC%95%84%ED%8C%8C%EC%B9%98-%ED%86%B0%EC%BA%A3%EC%9D%98-NIO-Connector-%EC%99%80-BIO-Connector%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)
- [About springboot tomcat acceptcount pool](https://stackoverflow.com/questions/65779046/about-springboot-tomcat-acceptcount-pool)
- [Tomcat 8.5 documentation](https://tomcat.apache.org/tomcat-8.5-doc/config/http.html)

---

[^fn-nth-1]: [K6 graceful stop](https://k6.io/docs/using-k6/scenarios/concepts/graceful-stop/)
[^fn-nth-2]: [spring-boot-configure-tomcat](https://www.baeldung.com/spring-boot-configure-tomcat#3-server-connections)
[^fn-nth-3]: The error margin of 1 is still a mystery.