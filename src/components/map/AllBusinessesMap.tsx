"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix para el icono roto de Leaflet en Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface BusinessPin {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  address: string | null;
  category: {
    name: string;
    emoji: string;
    slug: string;
  };
}

interface AllBusinessesMapProps {
  businesses: BusinessPin[];
}

// Centro de Villa Rica, Cauca — fallback si no hay negocios
const VILLA_RICA_CENTER: [number, number] = [3.178, -76.633];
const DEFAULT_ZOOM = 14;

export default function AllBusinessesMap({ businesses }: AllBusinessesMapProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string; slug: string }>();
    businesses.forEach(b => {
      if (b.category) {
        map.set(b.category.slug, b.category);
      }
    });
    return Array.from(map.values());
  }, [businesses]);

  const filtered = activeCategory
    ? businesses.filter(b => b.category?.slug === activeCategory)
    : businesses;

  const mapCenter: [number, number] = filtered.length > 0
    ? [
        filtered.reduce((sum, b) => sum + Number(b.latitude), 0) / filtered.length,
        filtered.reduce((sum, b) => sum + Number(b.longitude), 0) / filtered.length,
      ]
    : VILLA_RICA_CENTER;

  return (
    <div className="h-full w-full relative z-0">
      {/* Chips de filtro */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 flex-wrap justify-center px-4 w-full max-w-lg">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-pill text-xs font-bold shadow-md transition-all active:scale-95 ${
            activeCategory === null
              ? 'bg-accent text-white'
              : 'bg-white text-foreground border border-border hover:bg-surface'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-3 py-1.5 rounded-pill text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
              activeCategory === cat.slug
                ? 'bg-accent text-white'
                : 'bg-white text-foreground border border-border hover:bg-surface'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <MapContainer
        key={activeCategory || "all"} // Forzar re-render para centrar al filtrar
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((b) => (
          <Marker key={b.id} position={[b.latitude, b.longitude]}>
            <Popup>
              <div style={{ minWidth: "140px" }}>
                <p style={{ fontWeight: 700, fontSize: "14px", margin: "0 0 2px" }}>
                  {b.category.emoji} {b.name}
                </p>
                {b.address && (
                  <p style={{ fontSize: "12px", color: "#666", margin: "0 0 8px" }}>
                    {b.address}
                  </p>
                )}
                <Link
                  href={`/negocios/${b.slug}`}
                  style={{
                    display: "inline-block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#fff",
                    background: "#16a34a",
                    borderRadius: "9999px",
                    padding: "4px 12px",
                    textDecoration: "none",
                  }}
                >
                  Ver negocio →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
