---
title: Kotlinで地球の楕円体を利用する
categories: [Geotools]
date: 2022-03-23 17:34:00 +0900
tags: [geotools, geometry, kotlin, java, ellipsoid]
authors: haril
---

## 背景

![earth](./2022-03-23-ellipsoid.webp)
_画像の参照[^footnote]_

地球が平らでも完全な球体でもなく、不規則な楕円体であることを考えると、異なる経度と緯度の2点間の距離を迅速かつ正確に計算するための完璧な公式は存在しません。

しかし、geotoolsライブラリを使用することで、数学的に補正された近似値を簡単に取得することができます。

## 依存関係の追加

geotoolsで地球の楕円体を使用するには、関連するライブラリの依存関係を追加する必要があります。

```groovy
repositories {
    maven { url "https://repo.osgeo.org/repository/release/" }
    maven { url "https://download.osgeo.org/webdav/geotools/" }
    mavenCentral()
}

dependencies {
    ...
    implementation 'org.geotools:gt-referencing:26.2'
    ...
}
```

## コードの記述

まず、ソウルと釜山の座標をenumクラスとして定義します。

```kotlin
enum class City(val latitude: Double, val longitude: Double) {
    SEOUL(37.5642135, 127.0016985),
    BUSAN(35.1104, 129.0431);
}
```

次に、テストコードを通じて簡単な使用例を見てみましょう。

```kotlin
class EllipsoidTest {

    @Test
    internal fun createEllipsoid() {
        val ellipsoid = DefaultEllipsoid.WGS84  // GPSで使用されるWGS84測地系を使用して、地球に最も近い楕円体を作成

        val isSphere = ellipsoid.isSphere  // 球体か楕円体かを判定
        val semiMajorAxis = ellipsoid.semiMajorAxis  // 赤道半径、楕円体の長い半径
        val semiMinorAxis = ellipsoid.semiMinorAxis  // 極半径、楕円体の短い半径
        val eccentricity = ellipsoid.eccentricity  // 離心率、楕円体が球体にどれだけ近いかを示す
        val inverseFlattening = ellipsoid.inverseFlattening  // 逆扁平率の値
        val ivfDefinitive = ellipsoid.isIvfDefinitive // この楕円体に対して逆扁平率が決定的かどうかを示す

        // 大円距離
        val orthodromicDistance = ellipsoid.orthodromicDistance(
            City.SEOUL.longitude,
            City.SEOUL.latitude,
            City.BUSAN.longitude,
            City.BUSAN.latitude
        )

        println("isSphere = $isSphere")
        println("semiMajorAxis = $semiMajorAxis")
        println("semiMinorAxis = $semiMinorAxis")
        println("eccentricity = $eccentricity")
        println("inverseFlattening = $inverseFlattening")
        println("ivfDefinitive = $ivfDefinitive")
        println("orthodromicDistance = $orthodromicDistance")
    }
}
```

```text
isSphere = false
semiMajorAxis = 6378137.0
semiMinorAxis = 6356752.314245179
eccentricity = 0.08181919084262128
inverseFlattening = 298.257223563
ivfDefinitive = true
orthodromicDistance = 328199.9794919944
```

`DefaultEllipsoid.WGS84`を使用して地球の楕円体を作成できます。`WGS84`の代わりに`SPHERE`を使用すると、半径6371kmの球体が作成されます。

距離の結果はメートル（m）で表示されるため、キロメートルに変換すると約328kmになります。Googleで検索すると325kmと表示されるかもしれませんが、私が選んだ座標とGoogleが選んだ座標の違いを考慮すると、これは悪くない数字です。

他にも多くの機能がありますが、すべてをこの投稿でカバーするのは難しいため、必要に応じて別の投稿で取り上げます。

:::info

ビジネス要件によっては誤差が満足できない場合があるため、実際の実装前にgeotoolsの他の方法を十分にテストしてください。

:::

---

## 参考

[^footnote]: [SRIDと座標系の概要](https://www.alibabacloud.com/blog/an-overview-of-srid-and-coordinate-system_597004)