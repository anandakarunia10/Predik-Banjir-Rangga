"use client";
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MyMap({ tileUrl }: { tileUrl: string }) {
  return (
    <MapContainer 
      center={[-8.45, 115.05]} 
      zoom={11} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {tileUrl && (
        <TileLayer 
          url={tileUrl} 
          opacity={0.8}
          zIndex={1000}
        />
      )}
    </MapContainer>
  );
}