import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icons missing issue in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
const createCustomIcon = (colorHex) =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${colorHex}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const donorIcon = createCustomIcon('#14532D'); // Forest Green
const ngoIcon = createCustomIcon('#2563EB');   // Blue
const volunteerIcon = createCustomIcon('#F59E0B'); // Amber

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  center = [11.0168, 76.9558], // default Coimbatore
  zoom = 13,
  markers = [], // [{ position: [lat, lng], title, description, type: 'donor'|'ngo'|'volunteer' }]
  polyline = null, // [[lat, lng], [lat, lng]]
  className = 'h-72 w-full',
}) {
  const validCenter = center && center[0] && center[1] ? center : [11.0168, 76.9558];

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-inner border border-surface-border ${className}`}>
      <MapContainer
        center={validCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <ChangeView center={validCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m, idx) => {
          if (!m.position || !m.position[0] || !m.position[1]) return null;
          let icon = donorIcon;
          if (m.type === 'ngo') icon = ngoIcon;
          if (m.type === 'volunteer') icon = volunteerIcon;

          return (
            <Marker key={idx} position={m.position} icon={icon}>
              <Popup>
                <div className="p-1">
                  <strong className="block text-sm font-semibold">{m.title}</strong>
                  {m.description && <p className="text-xs text-gray-600 mt-1">{m.description}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {polyline && polyline.length >= 2 && (
          <Polyline positions={polyline} color="#14532D" weight={4} dashArray="8, 8" />
        )}
      </MapContainer>
    </div>
  );
}
