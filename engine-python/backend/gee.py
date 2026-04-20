import ee

ee.Initialize(project='polar-cargo-490100-m9')

tabanan = ee.Geometry.Rectangle([114.9, -8.6, 115.3, -8.2])

def uhi_map(year):
    lst_col = ee.ImageCollection("MODIS/061/MOD11A2") \
        .filterBounds(tabanan) \
        .filterDate(f"{year}-01-01", f"{year}-12-31") \
        .select("LST_Day_1km")
    
    lst_c = lst_col.mean().multiply(0.02).subtract(273.15)
    
    # Hitung rata-rata angka untuk ditampilkan di UI
    mean_val = 0
    try:
        stats = lst_c.reduceRegion(reducer=ee.Reducer.mean(), geometry=tabanan, scale=1000).getInfo()
        mean_val = stats.get('LST_Day_1km', 0)
    except: pass

    map_id = lst_c.clip(tabanan).getMapId({
        'min': 24, 'max': 32, 
        'palette': ['0000ff', '00ffff', 'ffff00', 'ff0000']
    })
    
    return {"tile": map_id['tile_fetcher'].url_format, "value": mean_val}

def ndvi_map(year):
    ndvi_col = ee.ImageCollection("MODIS/061/MOD13Q1") \
        .filterBounds(tabanan) \
        .filterDate(f"{year}-01-01", f"{year}-12-31") \
        .select("NDVI")
    
    ndvi = ndvi_col.median().multiply(0.0001)
    
    # Hitung rata-rata angka untuk ditampilkan di UI
    mean_val = 0
    try:
        stats = ndvi.reduceRegion(reducer=ee.Reducer.mean(), geometry=tabanan, scale=1000).getInfo()
        mean_val = stats.get('NDVI', 0)
    except: pass

    map_id = ndvi.clip(tabanan).getMapId({
        "min": 0.2, "max": 0.85,
        "palette": ['FFFFFF', 'F1B555', '99B718', '207401', '052901']
    })
    
    return {"tile": map_id['tile_fetcher'].url_format, "value": mean_val}

def uhi_stats(year):
    lst = ee.ImageCollection("MODIS/061/MOD11A2").filterBounds(tabanan).filterDate(f"{year}-01-01", f"{year}-12-31").select("LST_Day_1km").mean()
    lst_c = lst.multiply(0.02).subtract(273.15)
    area = lst_c.gt(30).multiply(ee.Image.pixelArea())
    stat = area.reduceRegion(reducer=ee.Reducer.sum(), geometry=tabanan, scale=1000, maxPixels=1e13)
    return stat.getInfo()