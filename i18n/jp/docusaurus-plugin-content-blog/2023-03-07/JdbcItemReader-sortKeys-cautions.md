---
title: "JdbcItemReaderでsortKeysを設定する際の注意点"
date: 2023-03-06 16:46:00 +0900
aliases: 
tags: [postgresql, rdb, spring, batch]
categories: 
authors: haril
description: "Spring BatchのJdbcPagingItemReaderを使用する際、sortKeysパラメータを設定する際には注意が必要です。ソート条件の順序が維持されない場合、意図した通りにインデックススキャンが行われない可能性があります。"
---

PostgreSQLで大量のデータを取得する際に遭遇した問題について共有したいと思います。

## 問題

Spring Batchの`JdbcPagingItemReader`を使用している際、以下のように`sortKeys`を設定しました：

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

現在のテーブルのインデックスは`timestamp`、`mmsi`、`imo_no`の複合インデックスとして設定されているため、データ取得時にインデックススキャンが行われると期待していました。しかし、実際にはSeqスキャンが発生しました。対象のテーブルには約2億件のレコードが含まれており、バッチ処理が完了する兆しが見えなかったため、最終的にバッチを強制終了する必要がありました。**なぜインデックス条件でクエリを実行しているのにSeqスキャンが発生したのでしょうか？🤔**

PostgreSQLでは、以下のような場合にSeqスキャンが発生します：

- テーブルのデータ量が少ないため、オプティマイザがSeqスキャンの方が速いと判断した場合
- クエリ対象のデータ量が多すぎる（テーブルの10%以上）場合、オプティマイザがインデックススキャンよりもSeqスキャンの方が効率的だと判断した場合
	- このような場合、`limit`を使用してデータ量を調整し、インデックススキャンを実行することができます

このケースでは、`select *`を使用していたため、大量のデータをクエリすることでSeqスキャンが発生する可能性がありました。しかし、`chunk size`のためにクエリは`limit`付きで実行されていたため、**インデックススキャンが連続して発生する**と考えていました。

## デバッグ

正確な原因を特定するために、実際に実行されているクエリを確認しましょう。YAML設定を少し変更することで、`JdbcPagingItemReader`が実行するクエリを観察できます。

```yaml
logging:
  level.org.springframework.jdbc.core.JdbcTemplate: DEBUG
 ```

バッチプロセスを再実行して、クエリを直接観察しました。

```sql
SELECT * FROM big_partitioned_table_202301 ORDER BY imo_no ASC, mmsi ASC, timestamp ASC LIMIT 1000
```

`order by`句の順序が奇妙に見えたので、再度実行しました。

```sql
SELECT * FROM big_partitioned_table_202301 ORDER BY timestamp ASC, mmsi ASC, imo_no ASC LIMIT 1000
```

実行ごとに`order by`条件の順序が変わっていることが明らかでした。

インデックススキャンを確実に行うためには、ソート条件を正しい順序で指定する必要があります。一般的な`Map`を`sortKeys`に渡すと順序が保証されないため、SQLクエリが意図した通りに実行されません。

順序を維持するためには、`LinkedHashMap`を使用して`sortKeys`を作成することができます。

```java
Map<String, Order> sortKeys = new LinkedHashMap<>();
sortKeys.put("timestamp", Order.ASCENDING);
sortKeys.put("mmsi", Order.ASCENDING);
sortKeys.put("imo_no", Order.ASCENDING);
```

この調整を行い、バッチを再実行したところ、ソート条件が正しい順序で指定されていることを確認できました。

```sql
SELECT * FROM big_partitioned_table_202301 ORDER BY timestamp ASC, mmsi ASC, imo_no ASC LIMIT 1000
```

## 結論

Seqスキャンがインデックススキャンの代わりに発生する問題は、アプリケーションのテストコードでは検証できないため、潜在的なバグに気づくことができませんでした。実際の運用環境でバッチ処理の大幅な遅延を観察して初めて、何かが間違っていることに気づきました。開発中には、`Map`データ構造によってソート条件の順序が変わる可能性を予想していませんでした。

幸いにも、大量のデータをクエリするためにインデックススキャンが発生しない場合、`LIMIT`クエリでバッチ処理が大幅に遅くなるため、問題に気づきやすくなります。しかし、データ量が少なく、インデックススキャンとSeqスキャンの実行速度が似ている場合、問題に気づくまでに時間がかかるかもしれません。

この問題を事前に予測し対処する方法について、さらに検討が必要です。`order by`条件の順序が重要な場合が多いため、可能な限り`HashMap`ではなく`LinkedHashMap`を使用することをお勧めします。