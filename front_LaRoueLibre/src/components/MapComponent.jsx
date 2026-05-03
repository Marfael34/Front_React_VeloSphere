import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';
import { renderToString } from 'react-dom/server';

// Correction pour les icônes par défaut de Leaflet avec Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Icônes personnalisées pour les lieux et les compétitions
const createCustomIcon = (color, iconType) => {
    const iconHtml = renderToString(
        <div style={{
            color: color,
            fontSize: '24px',
            filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {iconType === 'place' ? <FaMapMarkerAlt /> : <FaTrophy />}
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
};

const placeIcon = createCustomIcon('#ff9800', 'place'); // Orange pour les lieux
const competitionIcon = createCustomIcon('#2196f3', 'competition'); // Bleu pour les compétitions

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

const MapComponent = ({ points = [], center = [46.603354, 1.888334], zoom = 6 }) => {
    return (
        <div className="h-full w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <MapContainer 
                center={center} 
                zoom={zoom} 
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ background: '#1a1d21' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.esri.com/">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                
                {points.map((point, index) => {
                    if (!point.lat || !point.lng) return null;
                    
                    return (
                        <Marker 
                            key={`${point.type}-${point.id || index}`} 
                            position={[point.lat, point.lng]}
                            icon={point.type === 'place' ? placeIcon : competitionIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-black italic uppercase text-orange text-lg leading-tight mb-1">
                                        {point.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                        {point.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                            point.type === 'place' ? 'bg-orange/10 text-orange' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {point.type === 'place' ? 'Lieu à visiter' : 'Compétition'}
                                        </span>
                                        {point.link && (
                                            <a 
                                                href={point.link} 
                                                className="text-xs font-bold text-gray-800 hover:text-orange transition-colors"
                                            >
                                                Voir plus →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                <ChangeView center={center} zoom={zoom} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
