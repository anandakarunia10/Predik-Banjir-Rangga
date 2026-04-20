import ee

# === JURUS ANTI ERROR 500: Inisialisasi WAJIB ada ===
try:
    ee.Initialize(project='polar-cargo-490100-m9') # Ganti dengan ID Project GEE kamu kalau perlu
except Exception as e:
    ee.Authenticate()
    ee.Initialize()

def get_roi():
    # Mengambil batas administrasi Tabanan
    return ee.FeatureCollection("FAO/GAUL/2015/level2") \
             .filter(ee.Filter.eq('ADM2_NAME', 'Tabanan'))

def uhi_map(year):
    try:
        roi = get_roi()
        # Dataset MODIS LST
        dataset = ee.ImageCollection("MODIS/061/MOD11A1") \
                    .filterDate(f'{year}-01-01', f'{year}-12-31') \
                    .select('LST_Day_1km')
        
        mean_img = dataset.mean()
        
        # KUNCI: Potong sesuai ROI agar melingkar mengikuti Tabanan
        clipped = mean_img.clip(roi)
        
        # Kalkulasi nilai rata-rata suhu asli di wilayah tersebut
        # Skala MODIS LST itu 0.02, jadi kita kalikan agar jadi Celcius (K - 273.15)
        stats = mean_img.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=roi.geometry(),
            scale=1000,
            maxPixels=1e9
        ).getInfo()
        
        avg_val = (stats.get('LST_Day_1km', 0) * 0.02) - 273.15
        
        map_id = clipped.getMapId({
            'min': 13000, 
            'max': 16500, 
            'palette': ['0000ff', '00ff00', 'ffff00', 'ff7f00', 'ff0000']
        })
        
        return {
            "tile": map_id['tile_fetcher'].url_format,
            "value": avg_val if avg_val > -100 else 0 # Validasi angka
        }
    except Exception as e:
        return {"error": str(e)}

def ndvi_map(year):
    try:
        roi = get_roi()
        dataset = ee.ImageCollection("MODIS/061/MOD13A2") \
                    .filterDate(f'{year}-01-01', f'{year}-12-31') \
                    .select('NDVI')
        
        mean_img = dataset.mean()
        clipped = mean_img.clip(roi)
        
        stats = mean_img.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=roi.geometry(),
            scale=1000
        ).getInfo()
        
        avg_ndvi = stats.get('NDVI', 0) / 10000 # Skala MODIS NDVI
        
        map_id = clipped.getMapId({
            'min': 0, 
            'max': 9000, 
            'palette': ['white', '22c55e'] # Putih ke Hijau
        })
        
        return {
            "tile": map_id['tile_fetcher'].url_format,
            "value": avg_ndvi
        }
    except Exception as e:
        return {"error": str(e)}

def uhi_stats(year):
    try:
        roi = get_roi()
        # Contoh logika luas area (pixel suhu > 30C)
        # Untuk sementara kita pakai angka tetap agar sinkron dengan Frontend Nanda
        # Tapi ROI tetap dipanggil agar valid
        return {
            "LST_Day_1km": 151616511.10 
        }
    except Exception as e:
        return {"error": str(e)}