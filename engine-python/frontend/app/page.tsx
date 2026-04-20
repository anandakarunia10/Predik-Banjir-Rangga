"use client";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
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

const MapWithNoSSR = dynamic(() => import('@/components/MapContainer'), { ssr: false });

export default function Home() {
  const [tileUrl, setTileUrl] = useState("");
  const [stats, setStats] = useState("Sistem siap...");
  const [year, setYear] = useState("2022");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [chartData, setChartData] = useState({
    labels: ['Analisis'],
    datasets: [{
      label: 'Luas (km²)',
      data: [0],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: '#3b82f6',
      borderWidth: 2,
    }]
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // FUNGSI GEE (LST & NDVI) - SUDAH BALIK
  const fetchGEE = async (type: string) => {
    setLoading(true);
    setStats(`⏳ Memproses data ${type.toUpperCase()}...`);
    try {
      const res = await fetch(`http://127.0.0.1:5000/${type}?year=${year}`);
      const data = await res.json();
      if (data.tile) {
        setTileUrl(data.tile);
        const val = data.value ? data.value.toFixed(2) : "0.00";
        setStats(`${type === 'uhi' ? '🔴 Mode: Suhu Permukaan (LST)' : '🟢 Mode: Kerapatan Vegetasi (NDVI)'} | Rata-rata: ${val}`);
      }
    } catch (err) {
      setStats("❌ Gagal terhubung ke GEE");
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI STATISTIK
  const fetchStats = async () => {
    setLoading(true);
    setStats("⏳ Mengkalkulasi luas wilayah...");
    try {
      const res = await fetch(`http://127.0.0.1:5000/uhi/stats?year=${year}`);
      const data = await res.json();
      const rawVal = data.LST_Day_1km || Object.values(data)[0] || 0;
      const valKm2 = Number(rawVal) / 1000000;
      
      setStats(`📊 Hasil Analisis: Luas Area Panas mencapai ${valKm2.toFixed(2)} km²`);
      
      setChartData({
        labels: [`LST ${year}`],
        datasets: [{
          label: 'Luas (km²)',
          data: [valKm2],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 12,
        }]
      });
    } catch (e) { 
      setStats("❌ Gagal memproses statistik"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-[#f4f5f7] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <div className="w-[380px] p-8 bg-white/95 backdrop-blur-md flex flex-col z-[1000] border-r border-slate-100 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.03)] overflow-y-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center text-white font-bold text-xl">T</div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tighter text-slate-950 leading-none">WebGIS Tabanan</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Satellite Processor</p>
          </div>
        </div>
        
        <div className="space-y-6 flex-1">
          
          {/* Kontrol Tahun */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pilih Tahun</label>
            <div className="relative">
              <select 
                value={year} 
                onChange={(e)=>setYear(e.target.value)} 
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold text-sm appearance-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all cursor-pointer"
              >
                 {[2020, 2021, 2022, 2023, 2024].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>
          
          {/* Tombol-Tombol Utama */}
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => fetchGEE('uhi')} 
              disabled={loading}
              className="w-full bg-[#ef4444] text-white p-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-red-50 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
            >
              🔥 ANALISIS LST (SUHU)
            </button>
            <button 
              onClick={() => fetchGEE('ndvi')} 
              disabled={loading}
              className="w-full bg-[#22c55e] text-white p-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-green-50 hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50"
            >
              🌿 ANALISIS VEGETASI
            </button>
            <button 
              onClick={fetchStats} 
              disabled={loading}
              className="w-full bg-slate-900 text-white p-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              📊 KALKULASI LUAS AREA
            </button>
          </div>
          
          {/* Output Panel (Analisis Status) */}
          <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-inner text-[13px]">
             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Live Output Analysis</span>
             <div className="text-blue-900 font-semibold leading-relaxed tracking-tight">
               {stats}
             </div>
          </div>

          {/* Area Grafik */}
          <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)]" style={{ minHeight: '240px' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Luas Terdampak</h4>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">km²</span>
            </div>
            
            <div style={{ height: '160px', width: '100%' }}>
              {mounted && (
                <Bar 
                  key={JSON.stringify(chartData)} 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 1000, easing: 'easeOutQuart' },
                    scales: {
                      y: {
                        beginAtZero: true,
                        border: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 10 } },
                        grid: { color: '#f8fafc' }
                      },
                      x: {
                        border: { display: false },
                        ticks: { color: '#1e293b', font: { weight: 'bold', size: 11 } },
                        grid: { display: false }
                      }
                    },
                    plugins: { 
                      legend: { display: false },
                      tooltip: { cornerRadius: 10, padding: 10 }
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 text-center border-t border-slate-50">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Ganesha University • Rangga Project © 2026</p>
        </div>
      </div>
      
      {/* Container Peta */}
      <div className="flex-1 relative bg-[#edf0f4]">
        <MapWithNoSSR tileUrl={tileUrl} />
      </div>
    </main>
  );
}