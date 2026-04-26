"use client";

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
  const mapCenter: [number, number] = businesses.length > 0
    ? [
        businesses.reduce((sum, b) => sum + Number(b.latitude), 0) / businesses.length,
        businesses.reduce((sum, b) => sum + Number(b.longitude), 0) / businesses.length,
      ]
    : VILLA_RICA_CENTER;

  return (
    <MapContainer
      center={mapCenter}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {businesses.map((b) => (
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
  );
}
