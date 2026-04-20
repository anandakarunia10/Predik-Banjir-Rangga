"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MapWithNoSSR = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
});

export default function Home() {
  const [tileUrl, setTileUrl] = useState("");
  const [stats, setStats] = useState("Siap memproses data...");
  const [year, setYear] = useState("2022");
  const [loading, setLoading] = useState(false);
  
  // State grafik awal
  const [chartData, setChartData] = useState({
    labels: ['Menunggu Data'],
    datasets: [{
      label: 'Luas Area (km²)',
      data: [0],
      backgroundColor: 'rgba(52, 152, 219, 0.4)',
      borderColor: '#3498db',
      borderWidth: 1,
    }]
  });

  const fetchGEE = async (type: string) => {
    setLoading(true);
    setStats("⏳ Loading data satelit...");
    try {
      const res = await fetch(`http://127.0.0.1:5000/${type}?year=${year}`);
      const data = await res.json();
      if (data.tile) {
        setTileUrl(data.tile);
        const val = data.value ? data.value.toFixed(2) : "0.00";
        setStats(`${type === 'uhi' ? '🔴 Mode: UHI' : '🟢 Mode: NDVI'} | Rata-rata: ${val}`);
      }
    } catch (err) {
      setStats("❌ Koneksi Backend Gagal");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setStats("⏳ Menghitung luas area...");
    try {
      const res = await fetch(`http://127.0.0.1:5000/uhi/stats?year=${year}`);
      const data = await res.json();
      
      // Mengambil nilai LST_Day_1km dengan proteksi tipe data
      const rawVal = data.LST_Day_1km || Object.values(data)[0] || 0;
      const valKm2 = parseFloat(rawVal.toString()) / 1000000; 

      setStats(`📊 Luas Area Panas (>30°C): ${valKm2.toFixed(2)} km²`);

      // Update Chart dengan key baru agar komponen hancur dan buat ulang (Force Re-render)
      setChartData({
        labels: [`Area Panas ${year}`],
        datasets: [{
          label: `Luas (km²)`,
          data: [valKm2], 
          backgroundColor: '#e74c3c', 
          borderColor: '#c0392b',
          borderWidth: 2,
          borderRadius: 4,
        }]
      });
    } catch (err) {
      setStats("❌ Gagal memuat statistik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-[#e0e0e0]">
      {/* Sidebar */}
      <div className="w-[350px] bg-[#f8f9fa] h-full p-6 shadow-[-2px_0_10px_rgba(0,0,0,0.1)] flex flex-col z-[1000] overflow-y-auto">
        
        <div className="mb-6 text-left">
          <h2 className="text-[#2c3e50] text-2xl font-bold border-b-2 border-[#3498db] pb-2">
            WebGIS Tabanan
          </h2>
        </div>

        <div className="space-y-4 flex-1">
          {/* Kontrol Tahun */}
          <div className="text-left">
            <label className="block text-[#555] font-bold mb-1 text-sm">
              Pilih Tahun Analisis:
            </label>
            <select 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-white border border-[#ddd] rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-[#3498db] outline-none shadow-sm"
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-3">
            <button onClick={() => fetchGEE('uhi')} disabled={loading} className="w-full bg-[#e74c3c] hover:bg-[#c0392b] text-white p-3 rounded-md font-bold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50">
              Tampilkan Peta Suhu (UHI)
            </button>
            <button onClick={() => fetchGEE('ndvi')} disabled={loading} className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white p-3 rounded-md font-bold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50">
              Tampilkan Peta Vegetasi (NDVI)
            </button>
            <button onClick={fetchStats} disabled={loading} className="w-full bg-[#34495e] hover:bg-[#2c3e50] text-white p-3 rounded-md font-bold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50">
              Lihat Analisis Statistik
            </button>
          </div>

          {/* Panel Informasi */}
          <div className="mt-6 bg-white p-4 rounded-md border-l-[5px] border-[#3498db] shadow-sm text-left">
            <div className="text-sm text-[#2c3e50] font-medium leading-relaxed font-mono">
              {stats}
            </div>
          </div>

          {/* Area Visualisasi Grafik */}
          <div className="mt-6 bg-white p-3 rounded-md shadow-sm border border-gray-100 min-h-[200px]">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 text-left">Statistik Area (km²)</h4>
            <Bar 
              key={year + chartData.datasets[0].data[0]} // Key dinamis berdasarkan tahun & data
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: { 
                  y: { 
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' },
                    ticks: { font: { size: 10 }, color: '#7f8c8d' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { weight: 'bold' }, color: '#2c3e50' }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="mt-auto pt-8 text-left text-[10px] text-gray-400 italic">
          Data Source: Google Earth Engine & MODIS Satelit
        </div>
      </div>

      {/* Peta */}
      <div className="flex-1 relative bg-[#dcdde1]">
        <MapWithNoSSR tileUrl={tileUrl} />
      </div>
    </main>
  );
}