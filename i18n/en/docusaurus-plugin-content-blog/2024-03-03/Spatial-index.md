---
title: "Optimizing Spatial Data Queries Using Spatial Index"
date: 2024-03-03 14:01:05 +0900
aliases: null
tags: [spatial-index, index, postgis, geometry]
categories: null
authors: haril
---

![banner](./postgres-r-tree.png)

This article discusses the inefficient existing implementation and documents the methods attempted to improve it.

## Existing Issues

![](https://i.imgur.com/wPORK6n.png)
_While it wasn't impossible to join tables scattered across multiple databases in a single query, it was challenging..._

1. Is a specific coordinate within area "a"?
2. Writing join queries was difficult due to tables existing on physically different servers
    1. Why the need for a single query? Due to the large size of the data to be queried, I wanted to minimize the amount loaded into application memory as much as possible.
3. Since DB joins were not possible, application joins were necessary, resulting in around 24 billion loops (60000 * 40000)
    1. Although processing time was minimized through partitioning, CPU load remained high due to the loops.
4. Through the migration process of merging physically different databases into one, the opportunity for query optimization was achieved as joins became possible.

## Approach

Given that the primary reason for not being able to use database joins had been resolved, I actively considered utilizing index scans for geometry processing.

- Using PostGIS's GIST index allows for creating a spatial index similar to R-tree, enabling direct querying through index scans.
- To use spatial indexing, a column of type geometry is required.
- While latitude and longitude coordinates were available, there was no geometry type, so it was necessary to first create geometry POINT values using the coordinates.

To simulate this process, I prepared the exact same data as in the live DB and conducted experiments.

First, I created the index:

```postgresql
CREATE INDEX idx_port_geom ON port USING GIST (geom);
```

Then, I ran the PostGIS `contains` function:

```postgresql
SELECT *
FROM ais AS a
JOIN port AS p ON st_contains(p.geom, a.geom);
```

![](https://i.imgur.com/aMFmfCh.png)
_Awesome..._

## Results

### Before Applying Spatial Index

1 minute 47 seconds to 2 minutes 30 seconds

### After Applying Spatial Index

0.23 milliseconds to 0.243 milliseconds

I didn't prepare a capture, but before applying the index, queries took over 1 minute and 30 seconds.

Let's start with the conclusion and then delve into why these results were achieved.

## GiST (Generalized Search Tree)

A highly useful index for querying complex geometric data, the internal structure is illustrated below.

The idea of an R-tree is to divide the plane into rectangles to encompass all indexed points. Index rows store rectangles and can be defined as follows:

> "The point we are looking for is inside the given rectangle."

The root of the R-tree contains several of the largest rectangles (which may intersect). Child nodes contain smaller rectangles included in the parent node, collectively encompassing all base points.

In theory, leaf nodes should contain indexed points, but since all index rows must have the same data type, rectangles reduced to points are repeatedly stored.

To visualize this structure, let's look at images for three levels of an R-tree. The points represent airport coordinates.

![](https://i.imgur.com/VnMOteR.png)
_Level one: two large intersecting rectangles are visible._

Two intersecting rectangles are displayed.

![](https://i.imgur.com/HSqc7xA.png)
_Level two: large rectangles are split into smaller areas._

Large rectangles are divided into smaller areas.

![](https://i.imgur.com/PLDS9BR.png)
_Level three: each rectangle contains as many points as to fit one index page._

Each rectangle contains points that fit one index page.

These areas are structured into a tree, which is scanned during queries. For more detailed information, it is recommended to refer to the following [article](https://medium.com/postgres-professional/indexes-in-postgresql-5-gist-86e19781b5db).

## Conclusion

In this article, I briefly introduced the specific conditions, the problems encountered, the efforts made to solve them, and the basic concepts needed to address these issues. To summarize:

- Efficient joins using indexes could not be performed on physically separated databases.
- By enabling physical joins through migration, significant performance improvements were achieved.
- With the ability to utilize index scans, overall performance was greatly enhanced.
- There was no longer a need to unnecessarily load data into application memory.
- CPU load due to loops was alleviated.

## Reference

- [Spatial Indexing](https://postgis.net/workshops/postgis-intro/indexing.html)
- https://dbknowledge.tistory.com/48
- https://medium.com/postgres-professional/indexes-in-postgresql-5-gist-86e19781b5db