(function() {
    let map = null; 
    let currentLayer = null; 
    let chartInstance = null;
    let isInitializing = false;

    const getYear = () => document.getElementById("year").value;

    function updateStatus(text, color = "black") {
        const statusEl = document.getElementById("stats");
        if (statusEl) {
            statusEl.innerText = text;
            statusEl.style.color = color;
        }
    }

    function initApp() {
        if (isInitializing) return;
        isInitializing = true;
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            if (mapContainer._leaflet_id !== undefined || map) {
                if (map) map.remove();
                mapContainer.innerHTML = "";
            }
            try {
                map = L.map('map').setView([-8.45, 115.05], 11);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                document.getElementById("btnUHI").onclick = () => loadMapLayer('UHI');
                document.getElementById("btnNDVI").onclick = () => loadMapLayer('NDVI');
                document.getElementById("btnStats").onclick = loadStats;
                document.getElementById("geojsonFile").onchange = handleGeoJSON;

                setTimeout(() => { if (map) map.invalidateSize(); }, 500);
            } catch (e) { console.error(e); }
        }
        isInitializing = false;
    }

    function showLayer(tileUrl) {
        if (!map) return;
        if (currentLayer) map.removeLayer(currentLayer);
        currentLayer = L.tileLayer(tileUrl + "&t=" + Date.now(), { opacity: 0.8, zIndex: 1000 }).addTo(map);
    }

    async function fetchData(endpoint) {
        updateStatus("⏳ Memproses data satelit...", "blue");
        try {
            const response = await fetch(`http://127.0.0.1:5000${endpoint}?year=${getYear()}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data;
        } catch (err) {
            updateStatus("❌ Gagal memuat data.", "red");
            return null;
        }
    }

    async function loadMapLayer(type) {
        const data = await fetchData(type === 'UHI' ? '/uhi' : '/ndvi');
        if (data && data.tile) {
            showLayer(data.tile);
            const val = data.value ? data.value.toFixed(2) : "0.00";
            if (type === 'UHI') {
                updateStatus(`🔴 Mode: UHI | Rata-rata Suhu: ${val}°C`, "#e74c3c");
            } else {
                updateStatus(`🟢 Mode: NDVI | Indeks Vegetasi: ${val}`, "#2ecc71");
            }
        }
    }

    // ... (Fungsi loadStats dan handleGeoJSON tetap sama dengan kode kamu sebelumnya)
    async function loadStats() {
        const data = await fetchData('/uhi/stats');
        if (data) {
            const rawVal = Object.values(data)[0];
            const valKm2 = rawVal / 1000000; 
            updateStatus(`📊 Luas Area Panas (>30°C): ${valKm2.toFixed(2)} km²`);
            if (chartInstance) chartInstance.destroy();
            const ctx = document.getElementById("chart").getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [getYear()],
                    datasets: [{
                        label: `Luas Area Panas (km²)`,
                        data: [valKm2],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                }
            });
        }
    }

    function handleGeoJSON(e) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                L.geoJSON(JSON.parse(evt.target.result), {
                    style: { color: "#3388ff", weight: 2, fillOpacity: 0.1 }
                }).addTo(map);
                updateStatus("✅ GeoJSON Berhasil diunggah");
            } catch (err) { alert("File tidak valid!"); }
        };
        reader.readAsText(e.target.files[0]);
    }

    window.onload = initApp;
})();