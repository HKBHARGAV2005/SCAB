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

  const [manualLat, setManualLat] = React.useState<string>(gps.latitude.toString());
  const [manualLon, setManualLon] = React.useState<string>(gps.longitude.toString());
  const [manualAlt, setManualAlt] = React.useState<string>(gps.altitudeMeters.toString());
  const [manualName, setManualName] = React.useState<string>(gps.locationName);
  const [isLocating, setIsLocating] = React.useState<boolean>(false);

  // Sync inputs when gps prop updates
  useEffect(() => {
    setManualLat(gps.latitude.toString());
    setManualLon(gps.longitude.toString());
    setManualAlt(gps.altitudeMeters.toString());
    setManualName(gps.locationName);
  }, [gps.latitude, gps.longitude, gps.locationName, gps.altitudeMeters]);

  const handleApplyManualGps = async () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    const alt = parseFloat(manualAlt) || 1520;

    if (isNaN(lat) || isNaN(lon)) {
      alert('Please enter valid numeric latitude and longitude values.');
      return;
    }

    let finalName = manualName.trim();
    let finalState = gps.state;

    // If name is blank or default, auto reverse geocode
    if (!finalName || finalName === gps.locationName) {
      try {
        const { reverseGeocodeCoordinates } = await import('../services/weatherService');
        const geo = await reverseGeocodeCoordinates(lat, lon);
        finalName = geo.name;
        finalState = geo.state;
        setManualName(finalName);
      } catch {
        finalName = `Custom Station (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;
        finalState = 'Field Coordinates';
      }
    }

    onSelectPresetLocation({
      lat,
      lon,
      name: finalName,
      state: finalState,
      alt,
    });
  };

  const handleUseDeviceGps = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setIsLocating(false);
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lon = Math.round(pos.coords.longitude * 10000) / 10000;
          const alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : 1520;
          setManualLat(lat.toString());
          setManualLon(lon.toString());
          setManualAlt(alt.toString());

          try {
            const { reverseGeocodeCoordinates } = await import('../services/weatherService');
            const geo = await reverseGeocodeCoordinates(lat, lon);
            setManualName(geo.name);
            onSelectPresetLocation({
              lat,
              lon,
              name: geo.name,
              state: geo.state,
              alt,
            });
          } catch {
            onSelectPresetLocation({
              lat,
              lon,
              name: `Live Device (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`,
              state: 'Current GPS',
              alt,
            });
          }
        },
        (err) => {
          setIsLocating(false);
          alert(`Could not fetch device location: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Geolocation is not supported by your browser/device.');
    }
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-teal-400" />
            <span>u-blox NEO-6M GPS & SIM800L V2 Telemetry Tracking</span>
          </h3>
          <p className="text-xs text-slate-400">
            Auto-fetch location from <span className="text-teal-300 font-semibold">u-blox NEO-6M GPS module</span> & <span className="text-teal-300 font-semibold">SIM800L V2 GSM</span>, or enter manual coordinates to sync live 10-day Open-Meteo weather and run the SCAB AI decision engine.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-1 text-teal-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>NEO-6M: {gps.satellites} SAT FIX</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1 text-amber-300">
            <Mountain className="w-3.5 h-3.5" />
            <span>{gps.altitudeMeters}m ALT</span>
          </div>
        </div>
      </div>

      {/* Manual Coordinates Entry Studio */}
      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            Manual Coordinate & Location Input (Overrides u-blox NEO-6M / SIM800L)
          </span>
          <button
            onClick={handleUseDeviceGps}
            disabled={isLocating}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 px-2.5 py-1 rounded-lg border border-slate-700 font-mono transition-colors flex items-center gap-1"
          >
            <Radio className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My Device GPS'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Latitude (°N)
            </label>
            <input
              type="number"
              step="0.0001"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="e.g. 25.2541"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Longitude (°E)
            </label>
            <input
              type="number"
              step="0.0001"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              placeholder="e.g. 87.0437"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Altitude (m)
            </label>
            <input
              type="number"
              value={manualAlt}
              onChange={(e) => setManualAlt(e.target.value)}
              placeholder="e.g. 52"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Location / Institute
            </label>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="e.g. IIIT Bhagalpur"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 truncate">
            <span className="text-slate-500">Active:</span>
            <span className="text-white font-bold">{gps.locationName}</span>
            <span className="text-teal-400">({gps.latitude.toFixed(4)}°N, {gps.longitude.toFixed(4)}°E)</span>
          </div>

          <button
            onClick={handleApplyManualGps}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Apply Location & Fetch Weather</span>
          </button>
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
