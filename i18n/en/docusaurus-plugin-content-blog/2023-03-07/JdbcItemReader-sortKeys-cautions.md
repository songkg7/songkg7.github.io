---
title: "Caution when setting sortKeys in JdbcItemReader"
date: 2023-03-06 16:46:00 +0900
aliases: 
tags: [postgresql, rdb, spring, batch]
categories: 
authors: haril
description: "When using the Spring Batch JdbcPagingItemReader, be cautious when setting the sortKeys parameter. If the order of the sorting conditions is not maintained, an Index scan may not occur as intended."
---

I would like to share an issue I encountered while retrieving large amounts of data in PostgreSQL.

## Problem

While using the Spring Batch `JdbcPagingItemReader`, I set the `sortKeys` as follows:

```java
...
  .selectClause("SELECT *")
  .fromClause("FROM big_partitioned_table_" + yearMonth)
  .sortKeys(Map.of(
          "timestamp", Order.ASCENDING,
          "mmsi", Order.ASCENDING,
          "imo_no", Order.ASCENDING
      )
  )
...
```

Although the current table's index is set as a composite index with `timestamp`, `mmsi`, and `imo_no`, I expected an Index scan to occur during the retrieval. However, in reality, a Seq scan occurred. The target table contains around 200 million records, causing the batch process to show no signs of completion. Eventually, I had to forcibly shut down the batch. **Why did a Seq scan occur even when querying with index conditions? 🤔**

In PostgreSQL, Seq scans occur in the following cases:

- When the optimizer determines that a Seq scan is faster due to the table having a small amount of data
- When the data being queried is too large (more than 10% of the table), and the optimizer deems Index scan less efficient than Seq scan
	- In such cases, you can use `limit` to adjust the amount of data and execute an Index scan

In this case, since `select *` was used, there was a possibility of a Seq scan due to the large amount of data being queried. However, due to the `chunk size`, the query was performed with `limit`, so I thought that **Index scan would occur continuously**.

## Debugging

To identify the exact cause, let's check the actual query being executed. By slightly modifying the YAML configuration, we can observe the queries executed by the `JdbcPagingItemReader`.

```yaml
logging:
  level.org.springframework.jdbc.core.JdbcTemplate: DEBUG
 ```

I reran the batch process to directly observe the queries.

```sql
SELECT * FROM big_partitioned_table_202301 ORDER BY imo_no ASC, mmsi ASC, timestamp ASC LIMIT 1000
```

The order of the `order by` clause seemed odd, so I ran it again.

```sql
SELECT * FROM big_partitioned_table_202301 ORDER BY timestamp ASC, mmsi ASC, imo_no ASC LIMIT 1000
```

It was evident that the order by condition was changing with each execution.

To ensure the correct order for an Index scan, the sorting conditions must be specified in the correct order. Passing a general `Map` to `sortKeys` does not guarantee the order, leading to the SQL query not executing as intended.

To maintain order, you can use a `LinkedHashMap` to create the `sortKeys`.

```java
Map<String, Order> sortKeys = new LinkedHashMap<>();
sortKeys.put("timestamp", Order.ASCENDING);
sortKeys.put("mmsi", Order.ASCENDING);
sortKeys.put("imo_no", Order.ASCENDING);
```

After making this adjustment and rerunning the batch, we could confirm that the sorting conditions were specified in the correct order.

```sql
SELECT * FROM big_partitioned_table_202301 ORDER BY timestamp ASC, mmsi ASC, imo_no ASC LIMIT 1000
```

## Conclusion

The issue of Seq scan occurring instead of an Index scan was not something that could be verified with the application's test code, so we were unaware of any potential bugs. It was only when we observed a significant slowdown in the batch process in the production environment that we realized something was amiss. During development, I had not anticipated that the order of sorting conditions could change due to the `Map` data structure.

Fortunately, if an Index scan does not occur due to the large amount of data being queried, the batch process would slow down significantly with the `LIMIT` query, making it easy to notice the issue. However, if the data volume was low and the execution speeds of Index scan and Seq scan were similar, it might have taken a while to notice the problem.

Further consideration is needed on how to anticipate and address this issue in advance. Since the order of the `order by` condition is often crucial, it is advisable to use `LinkedHashMap` over `HashMap` whenever possible.