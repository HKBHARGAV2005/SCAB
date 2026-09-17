import React, { useEffect, useRef } from 'react';
import { Navigation, Radio, Mountain } from 'lucide-react';
import { GpsLocation } from '../types/telemetry';

interface GpsMapTrackerProps {
  gps: GpsLocation;
  onSelectPresetLocation: (loc: { lat: number; lon: number; name: string; state: string; alt: number }) => void;
}

export const GpsMapTracker: React.FC<GpsMapTrackerProps> = ({
  gps,
  onSelectPresetLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically load Leaflet to ensure zero SSR/window errors
    let isMounted = true;
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([gps.latitude, gps.longitude], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors | SIH 2026',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-gps-icon',
          html: `
            <div style="background-color: #14b8a6; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 15px #14b8a6; display: flex; align-items: center; justify-content: center;">
              <div style="background-color: #042f2e; width: 10px; height: 10px; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([gps.latitude, gps.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`<b>${gps.locationName}</b><br/>${gps.state}<br/>Alt: ${gps.altitudeMeters}m`).openPopup();

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.setView([gps.latitude, gps.longitude], 9);
        if (markerRef.current) {
          markerRef.current.setLatLng([gps.latitude, gps.longitude]);
          markerRef.current.setPopupContent(`<b>${gps.locationName}</b><br/>${gps.state}<br/>Alt: ${gps.altitudeMeters}m`);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [gps.latitude, gps.longitude, gps.locationName, gps.state, gps.altitudeMeters]);

  const presets = [
    { name: 'Shillong (Rural Cluster)', state: 'Meghalaya', lat: 25.5788, lon: 91.8933, alt: 1525 },
    { name: 'Cherrapunji (Sohra)', state: 'Meghalaya', lat: 25.2986, lon: 91.7324, alt: 1430 },
    { name: 'Jorhat (Horticulture Farm)', state: 'Assam', lat: 26.7509, lon: 94.2037, alt: 116 },
    { name: 'Tawang (High Altitude)', state: 'Arunachal Pradesh', lat: 27.586, lon: 91.8594, alt: 3048 },
    { name: 'Kohima (Naga Mircha Cluster)', state: 'Nagaland', lat: 25.6751, lon: 94.1086, alt: 1444 },
    { name: 'Gangtok (Organic Belt)', state: 'Sikkim', lat: 27.3389, lon: 88.6065, alt: 1650 },
  ];

  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-teal-400" />
            <span>u-blox NEO GPS Tracking & Deployment Location</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time coordinates transmitted via SIM800L SMS/GPRS to drive 10-day local microclimate forecasting.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-1 text-teal-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{gps.satellites} SAT FIX</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1 text-amber-300">
            <Mountain className="w-3.5 h-3.5" />
            <span>{gps.altitudeMeters}m ALT</span>
          </div>
        </div>
      </div>

      {/* Quick Location Switcher Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] uppercase font-bold shrink-0 mr-1">
          NER Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => onSelectPresetLocation(p)}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
              p.name === gps.locationName
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
            }`}
          >
            {p.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Leaflet Map Box */}
      <div className="h-64 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-700/60 shadow-inner relative z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
