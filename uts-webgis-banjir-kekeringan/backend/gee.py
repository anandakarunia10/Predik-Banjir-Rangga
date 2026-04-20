import ee

ee.Initialize(project='uts-web-gis-banjir-kekeringan')

# ===== WILAYAH TABANAN =====
tabanan = ee.Geometry.Rectangle([
    114.9,
    -8.6,
    115.3,
    -8.2
])

# ================= UHI =================
def uhi_map(year):

    # MODIS LST
    lst = ee.ImageCollection("MODIS/061/MOD11A2") \
        .filterBounds(tabanan) \
        .filterDate(f"{year}-01-01", f"{year}-12-31") \
        .select("LST_Day_1km") \
        .mean()

    # konversi ke Celcius
    lst = lst.multiply(0.02).subtract(273.15)

    # klasifikasi suhu
    hot = lst.gt(30)
    medium = lst.gt(27)

    classified = hot.multiply(2).add(medium)

    return classified.selfMask().clip(tabanan).getMapId({
        "min": 1,
        "max": 2,
        "palette": ["orange", "red"]
    })


# ================= NDVI =================
def ndvi_map(year):

    ndvi = ee.ImageCollection("MODIS/061/MOD13Q1") \
        .filterBounds(tabanan) \
        .filterDate(f"{year}-01-01", f"{year}-12-31") \
        .select("NDVI") \
        .mean()

    ndvi = ndvi.multiply(0.0001)

    return ndvi.clip(tabanan).getMapId({
        "min": 0,
        "max": 1,
        "palette": ["white", "green"]
    })


# ================= STATISTIK =================
def uhi_stats(year):

    lst = ee.ImageCollection("MODIS/061/MOD11A2") \
        .filterBounds(tabanan) \
        .filterDate(f"{year}-01-01", f"{year}-12-31") \
        .select("LST_Day_1km") \
        .mean()

    lst = lst.multiply(0.02).subtract(273.15)

    area = lst.gt(30).multiply(ee.Image.pixelArea())

    stat = area.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=tabanan,
        scale=1000,
        maxPixels=1e13
    )

    return stat.getInfo()