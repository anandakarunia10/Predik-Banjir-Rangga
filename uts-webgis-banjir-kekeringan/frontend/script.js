console.log("JS Loaded"); // DEBUG

let map = L.map('map').setView([-8.4, 115.1], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

let layer;
let chart;

// ===== AMBIL TAHUN =====
function getYear(){
    return document.getElementById("year").value;
}

// ===== TAMPILKAN LAYER =====
function showLayer(tile){
    if(layer) map.removeLayer(layer);

    console.log("Tile:", tile);

    layer = L.tileLayer(tile + "&t=" + Date.now(), {
        opacity: 0.6
    }).addTo(map);
}

// ===== UHI =====
function loadUHI(){
    console.log("Klik UHI");

    fetch(`http://127.0.0.1:5000/uhi?year=${getYear()}`)
    .then(res => res.json())
    .then(data => {
        if(data.error){
            alert(data.error);
            return;
        }

        showLayer(data.tile);

        document.getElementById("stats").innerHTML =
        "🔴 UHI tinggi = panas tinggi";
    })
    .catch(err=>{
        console.error(err);
        alert("Backend error");
    });
}

// ===== NDVI =====
function loadNDVI(){
    console.log("Klik NDVI");

    fetch(`http://127.0.0.1:5000/ndvi?year=${getYear()}`)
    .then(res => res.json())
    .then(data => {
        showLayer(data.tile);

        document.getElementById("stats").innerHTML =
        "🟢 NDVI tinggi = vegetasi/subak";
    });
}

// ===== STATISTIK =====
function loadStats(){
    fetch(`http://127.0.0.1:5000/uhi/stats?year=${getYear()}`)
    .then(res => res.json())
    .then(data => {

        let val = Object.values(data)[0] / 1000000;

        document.getElementById("stats").innerHTML =
        "Area panas: " + val.toFixed(2) + " km²";

        if(chart) chart.destroy();

        chart = new Chart(document.getElementById("chart"), {
            type: 'bar',
            data: {
                labels: ["UHI"],
                datasets: [{
                    label: "km²",
                    data: [val]
                }]
            }
        });
    });
}

// ===== GEOJSON =====
document.getElementById("geojsonFile").addEventListener("change", function(e){
    let reader = new FileReader();

    reader.onload = function(evt){
        let geojson = JSON.parse(evt.target.result);
        L.geoJSON(geojson).addTo(map);
    };

    reader.readAsText(e.target.files[0]);
});

// ===== EVENT LISTENER (PENTING) =====
document.getElementById("btnUHI").onclick = loadUHI;
document.getElementById("btnNDVI").onclick = loadNDVI;
document.getElementById("btnStats").onclick = loadStats;