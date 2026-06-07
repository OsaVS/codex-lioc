import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { StationLocation } from '../../types/replenishment';

// Fix leaflet default icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icons for Statuses
const normalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const criticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const lowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface Props {
  stations: StationLocation[];
}

export default function StationMap({ stations }: Props) {
  // Default center (e.g., Colombo, Sri Lanka)
  const center: [number, number] = [6.9271, 79.8612];

  const getIcon = (status: string) => {
    if (status === 'CRITICAL') return criticalIcon;
    if (status === 'LOW') return lowIcon;
    return normalIcon;
  };

  return (
    <div className="glass-card p-4 rounded-2xl border border-slate-800/80 h-96 z-0 relative shadow-lg">
      <h3 className="font-bold text-lg mb-4 text-slate-100 border-b border-slate-800 pb-2">Regional Station Map</h3>
      <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-800/80">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map(station => (
            <Marker 
              key={station.stationId} 
              position={[station.latitude, station.longitude]}
              icon={getIcon(station.status)}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-bold">{station.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{station.stationId}</p>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    station.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    station.status === 'LOW' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {station.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}