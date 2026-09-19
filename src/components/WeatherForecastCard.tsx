import React, { useState } from 'react';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertCircle,
  Calendar,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { WeatherData, DailyForecast, HourlyForecast } from '../types/weather';

interface WeatherForecastCardProps {
  weather: WeatherData;
}

// --- Google Weather Authentic Vector SVGs ---

// 1. Full Sun: Scalloped 12-lobed golden flower sun disc
const FullSunIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={`${className} flex-shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gwFullSunGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <g transform="translate(16, 16)">
      <circle cx="0" cy="0" r="11.5" fill="url(#gwFullSunGrad)" />
      {[0, 30, 60].map((angle) => (
        <rect
          key={angle}
          x="-11.5"
          y="-11.5"
          width="23"
          height="23"
          rx="6"
          fill="url(#gwFullSunGrad)"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle cx="0" cy="0" r="8" fill="#FDE047" opacity="0.35" />
    </g>
  </svg>
);

// 2. Partly Sunny: Golden scalloped sun with puffy white/grey cloud in front
const PartlySunnyIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={`${className} flex-shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gwPartSunGrad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="60%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="gwCloudDayGrad" x1="18" y1="13" x2="18" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
    </defs>
    {/* Sun in upper left */}
    <g transform="translate(12, 11)">
      <circle cx="0" cy="0" r="8.5" fill="url(#gwPartSunGrad)" />
      {[0, 30, 60].map((angle) => (
        <rect
          key={angle}
          x="-8.5"
          y="-8.5"
          width="17"
          height="17"
          rx="4.5"
          fill="url(#gwPartSunGrad)"
          transform={`rotate(${angle})`}
        />
      ))}
    </g>
    {/* White cloud in lower right */}
    <path
      d="M21 15 C20.3 15 19.6 15.2 19 15.5 C18 13.5 15.8 12 13.5 12 C10.2 12 7.5 14.7 7.5 18 C7.5 18.4 7.6 18.8 7.7 19.2 C6.4 19.7 5.5 21 5.5 22.5 C5.5 24.4 7.1 26 9 26 L22.5 26 C24.4 26 26 24.4 26 22.5 C26 20.7 24.6 19.2 22.8 19 C22.9 18.7 23 18.3 23 18 C23 16.3 21.7 15 21 15 Z"
      fill="url(#gwCloudDayGrad)"
      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
    />
  </svg>
);

// 3. Cloudy: Overcast layered soft clouds (darker rear + lighter front)
const CloudyIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={`${className} flex-shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gwCloudBack" x1="15" y1="7" x2="15" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="gwCloudFront" x1="18" y1="13" x2="18" y2="27" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
    </defs>
    {/* Darker rear cloud */}
    <path
      d="M19 9 C18.3 9 17.6 9.2 17 9.5 C16 7.5 13.8 6 11.5 6 C8.2 6 5.5 8.7 5.5 12 C5.5 12.4 5.6 12.8 5.7 13.2 C4.4 13.7 3.5 15 3.5 16.5 C3.5 18.4 5.1 20 7 20 L20.5 20 C22.4 20 24 18.4 24 16.5 C24 14.7 22.6 13.2 20.8 13 C20.9 12.7 21 12.3 21 12 C21 10.3 19.7 9 19 9 Z"
      fill="url(#gwCloudBack)"
    />
    {/* Foreground puffy cloud */}
    <path
      d="M21 15 C20.3 15 19.6 15.2 19 15.5 C18 13.5 15.8 12 13.5 12 C10.2 12 7.5 14.7 7.5 18 C7.5 18.4 7.6 18.8 7.7 19.2 C6.4 19.7 5.5 21 5.5 22.5 C5.5 24.4 7.1 26 9 26 L22.5 26 C24.4 26 26 24.4 26 22.5 C26 20.7 24.6 19.2 22.8 19 C22.9 18.7 23 18.3 23 18 C23 16.3 21.7 15 21 15 Z"
      fill="url(#gwCloudFront)"
      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
    />
  </svg>
);

// 4. Rain / Light Rain: Smooth dark slate cloud with bright blue teardrop water drops
const RainIcon: React.FC<{ isHeavy?: boolean; className?: string }> = ({ isHeavy = false, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={`${className} flex-shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gwRainCloud" x1="16" y1="6" x2="16" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="gwRainDrop" x1="16" y1="21" x2="16" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    {/* Dark rounded rain cloud */}
    <path
      d="M21 9 C20.3 9 19.6 9.2 19 9.5 C18 7.5 15.8 6 13.5 6 C10.2 6 7.5 8.7 7.5 12 C7.5 12.4 7.6 12.8 7.7 13.2 C6.4 13.7 5.5 15 5.5 16.5 C5.5 18.4 7.1 20 9 20 L22.5 20 C24.4 20 26 18.4 26 16.5 C26 14.7 24.6 13.2 22.8 13 C22.9 12.7 23 12.3 23 12 C23 10.3 21.7 9 21 9 Z"
      fill="url(#gwRainCloud)"
      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"
    />
    {/* Center teardrop raindrop */}
    <path
      d="M16 22 C16 22 13.8 25.2 13.8 26.5 C13.8 27.7 14.8 28.7 16 28.7 C17.2 28.7 18.2 27.7 18.2 26.5 C18.2 25.2 16 22 16 22 Z"
      fill="url(#gwRainDrop)"
    />
    {isHeavy && (
      <>
        <path
          d="M11 22.5 C11 22.5 9.2 25 9.2 26 C9.2 27 10 27.8 11 27.8 C12 27.8 12.8 27 12.8 26 C12.8 25 11 22.5 11 22.5 Z"
          fill="url(#gwRainDrop)"
        />
        <path
          d="M21 22.5 C21 22.5 19.2 25 19.2 26 C19.2 27 20 27.8 21 27.8 C22 27.8 22.8 27 22.8 26 C22.8 25 21 22.5 21 22.5 Z"
          fill="url(#gwRainDrop)"
        />
      </>
    )}
  </svg>
);

// 5. Thunderstorm / Scattered Storm: Dark storm cloud with sharp golden lightning bolt
const ThunderstormIcon: React.FC<{ hasSun?: boolean; className?: string }> = ({ hasSun = false, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={`${className} flex-shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gwStormSun" x1="10" y1="2" x2="10" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="gwStormCloud" x1="16" y1="7" x2="16" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="gwLightning" x1="16" y1="16" x2="16" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {hasSun && (
      <g transform="translate(10, 9)">
        <circle cx="0" cy="0" r="6.5" fill="url(#gwStormSun)" />
        {[0, 30, 60].map((angle) => (
          <rect
            key={angle}
            x="-6.5"
            y="-6.5"
            width="13"
            height="13"
            rx="3.5"
            fill="url(#gwStormSun)"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    )}
    {/* Dark storm cloud */}
    <path
      d="M21 9 C20.3 9 19.6 9.2 19 9.5 C18 7.5 15.8 6 13.5 6 C10.2 6 7.5 8.7 7.5 12 C7.5 12.4 7.6 12.8 7.7 13.2 C6.4 13.7 5.5 15 5.5 16.5 C5.5 18.4 7.1 20 9 20 L22.5 20 C24.4 20 26 18.4 26 16.5 C26 14.7 24.6 13.2 22.8 13 C22.9 12.7 23 12.3 23 12 C23 10.3 21.7 9 21 9 Z"
      fill="url(#gwStormCloud)"
      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"
    />
    {/* Sharp golden lightning bolt */}
    <path
      d="M17 16 L13.5 22 L16.5 22 L14 28 L20 21 L17 21 L18.5 16 Z"
      fill="url(#gwLightning)"
      filter="drop-shadow(0 0 4px rgba(250,204,21,0.8))"
    />
    {/* Raindrop on left */}
    <path
      d="M10.5 21 C10.5 21 9.2 23 9.2 23.8 C9.2 24.5 9.8 25 10.5 25 C11.2 25 11.8 24.5 11.8 23.8 C11.8 23 10.5 21 10.5 21 Z"
      fill="#38BDF8"
    />
  </svg>
);

// 6. Clear Night: Solid smooth sky-blue crescent moon
const ClearNightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={`${className} flex-shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gwNightMoon" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="40%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <path
      d="M21.5 19.5 C20.4 20.8 18.8 21.6 17 21.6 C13.1 21.6 10 18.5 10 14.6 C10 12 11.4 9.8 13.5 8.6 C9.2 9.4 6 13.1 6 17.6 C6 22.8 10.2 27 15.4 27 C19.3 27 22.6 24.5 23.8 21 C23 20.6 22.2 20.1 21.5 19.5 Z"
      fill="url(#gwNightMoon)"
      filter="drop-shadow(0 0 5px rgba(96,165,250,0.5))"
    />
  </svg>
);

// 7. Partly Cloudy Night: Sky-blue crescent moon with soft puffy white cloud in front
const PartlyCloudyNightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={`${className} flex-shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gwNightPartMoon" x1="14" y1="4" x2="14" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
      <linearGradient id="gwNightCloud" x1="18" y1="13" x2="18" y2="27" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
    </defs>
    {/* Blue crescent moon in upper left */}
    <path
      d="M17.5 14.5 C16.7 15.4 15.5 16 14.2 16 C11.4 16 9.2 13.8 9.2 11 C9.2 9.1 10.2 7.5 11.7 6.6 C8.6 7.2 6.3 9.9 6.3 13.1 C6.3 16.9 9.4 19.9 13.1 19.9 C16 19.9 18.4 18.1 19.2 15.6 C18.6 15.3 18 14.9 17.5 14.5 Z"
      fill="url(#gwNightPartMoon)"
      filter="drop-shadow(0 0 3px rgba(96,165,250,0.4))"
    />
    {/* Puffy cloud in bottom right */}
    <path
      d="M21 16 C20.3 16 19.6 16.2 19 16.5 C18 14.4 15.8 13 13.5 13 C10.1 13 7.5 15.7 7.5 19 C7.5 19.4 7.6 19.8 7.7 20.2 C6.4 20.7 5.5 22 5.5 23.5 C5.5 25.4 7.1 27 9 27 L22.5 27 C24.4 26 26 24.4 26 22.5 C26 20.7 24.6 19.2 22.8 20 C22.9 19.7 23 19.3 23 19 C23 17.3 21.7 16 21 16 Z"
      fill="url(#gwNightCloud)"
      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
    />
  </svg>
);

// Visual weather condition icon renderer matching Google Weather art style
const WeatherConditionIcon: React.FC<{
  condition: DailyForecast['weatherCondition'];
  className?: string;
}> = ({ condition, className = 'w-6 h-6' }) => {
  switch (condition) {
    case 'Sunny':
      return <FullSunIcon className={className} />;
    case 'Partly Sunny':
    case 'Partly Cloudy':
      return <PartlySunnyIcon className={className} />;
    case 'Cloudy':
      return <CloudyIcon className={className} />;
    case 'Light Rain':
      return <RainIcon isHeavy={false} className={className} />;
    case 'Rain':
    case 'Rain / Monsoon':
      return <RainIcon isHeavy={true} className={className} />;
    case 'Scattered Thunderstorm':
      return <ThunderstormIcon hasSun={true} className={className} />;
    case 'Heavy Storm':
    case 'Thunderstorm':
      return <ThunderstormIcon hasSun={false} className={className} />;
    case 'Clear Sky Night':
    case 'Clear Night':
      return <ClearNightIcon className={className} />;
    case 'Partly Cloudy Night':
      return <PartlyCloudyNightIcon className={className} />;
    default:
      return <PartlySunnyIcon className={className} />;
  }
};

// Compass Dial Graphic for Wind Direction
const WindCompassDial: React.FC<{ deg: number }> = ({ deg }) => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Outer circular dotted arc */}
      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="3 4"
          opacity="0.8"
        />
      </svg>
      {/* North marker */}
      <span className="absolute top-0 text-[10px] font-bold text-slate-400 tracking-wider">N</span>
      {/* Soft rounded direction pointer wedge */}
      <div
        className="absolute w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out"
        style={{ transform: `rotate(${deg}deg)` }}
      >
        <div className="w-6 h-6 bg-white/95 rounded-tl-full rounded-br-none rounded-tr-full rounded-bl-full shadow-lg shadow-sky-500/20 transform -rotate-45" />
      </div>
    </div>
  );
};

// Vertical Stadium Capsule Gauge for Humidity
const HumidityCapsuleGauge: React.FC<{ value: number }> = ({ value }) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-1.5 h-16">
      {/* Left indicator triangle */}
      <div className="relative h-14 w-2 flex flex-col justify-end">
        <div
          className="absolute left-0 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-amber-400 transition-all duration-500"
          style={{ bottom: `calc(${clamped}% - 4px)` }}
        />
      </div>

      {/* Vertical capsule tube */}
      <div className="relative w-7 h-14 bg-slate-800 rounded-full p-0.5 border border-slate-700/80 overflow-hidden flex flex-col justify-end shadow-inner">
        <div
          className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-full transition-all duration-500 shadow-md"
          style={{ height: `${clamped}%` }}
        />
      </div>

      {/* Right scale labels */}
      <div className="flex flex-col justify-between h-14 text-[9px] font-mono text-slate-400">
        <span>100</span>
        <span>0</span>
      </div>
    </div>
  );
};

// UV Radial Arc Gauge
const UvRadialGauge: React.FC<{ uv: number }> = ({ uv }) => {
  const color =
    uv <= 2
      ? 'from-emerald-400 to-teal-500'
      : uv <= 5
      ? 'from-yellow-400 to-amber-500'
      : uv <= 7
      ? 'from-amber-500 to-orange-500'
      : uv <= 10
      ? 'from-rose-500 to-red-600'
      : 'from-purple-600 to-pink-600';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Circular scalloped pill dial */}
        <div
          className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${color} shadow-lg shadow-rose-500/20 flex items-center justify-center transition-all duration-500`}
        >
          <div className="w-5 h-5 rounded-full bg-[#152331]/90 flex items-center justify-center text-[10px] font-black text-white">
            {uv}
          </div>
        </div>
      </div>
      <div className="absolute right-0 flex flex-col justify-between h-14 text-[9px] font-mono text-slate-400">
        <span>11+</span>
        <span>0</span>
      </div>
    </div>
  );
};

export const WeatherForecastCard: React.FC<WeatherForecastCardProps> = ({ weather }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'precipitation' | 'wind' | 'humidity' | 'solar'>('humidity');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const days = weather.daily || [];
  const selectedDay = days[selectedDayIndex] || days[0];
  const hourlyData = selectedDay?.hourlyData || [];

  const upcomingMonsoonDays = days.filter((d) => d.isSevereMonsoonDay);

  // Hourly details summary calculation based on activeTab
  const getTabSummary = () => {
    switch (activeTab) {
      case 'humidity':
        return {
          title: "Today's average",
          value: `${selectedDay.avgHumidity}%`,
          unit: '',
        };
      case 'precipitation':
        return {
          title: 'Total expected precipitation',
          value: `${selectedDay.totalPrecipitationMm} mm`,
          unit: `• Peak probability ${selectedDay.rainProbabilityMax}%`,
        };
      case 'wind':
        return {
          title: 'Maximum wind speed',
          value: `${selectedDay.windSpeedMax} km/h`,
          unit: `• ${selectedDay.windDescription}`,
        };
      case 'solar':
        return {
          title: 'Total solar PV harvest',
          value: `${selectedDay.estimatedSolarGenerationKwh} kWh`,
          unit: `• ${selectedDay.solarHoursEstimate} peak sun hours`,
        };
    }
  };

  const tabSummary = getTabSummary();

  // Helper to get metric for an hour based on activeTab
  const getHourMetric = (h: HourlyForecast) => {
    switch (activeTab) {
      case 'humidity':
        return {
          valText: `${h.relativeHumidity}%`,
          barHeightPct: Math.min(100, Math.max(25, h.relativeHumidity)),
          gradient: 'from-amber-500 to-orange-500',
        };
      case 'precipitation':
        return {
          valText: `${h.precipitationProbability}%`,
          barHeightPct: Math.min(100, Math.max(15, h.precipitationProbability)),
          gradient: 'from-sky-400 to-blue-600',
        };
      case 'wind':
        return {
          valText: `${h.windSpeed}k`,
          barHeightPct: Math.min(100, Math.max(20, (h.windSpeed / 35) * 100)),
          gradient: 'from-teal-400 to-emerald-500',
        };
      case 'solar':
        return {
          valText: `${h.solarRadiationWatts}w`,
          barHeightPct: Math.min(100, Math.max(12, (h.solarRadiationWatts / 900) * 100)),
          gradient: 'from-yellow-400 to-amber-500',
        };
    }
  };

  // The complete Google Weather detail body
  const renderDetailContent = () => (
    <div className="space-y-4">
      {/* 1. Top 10-Day Selector Carousel (Clickable Days) */}
      {/* 1. Top 10-Day Selector Carousel (Clickable Days with Severe Highlights) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              10-Day Forecast Schedule (Tap any day)
            </span>
            {upcomingMonsoonDays.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
                <AlertCircle className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>{upcomingMonsoonDays.length} Severe Days Detected by AI</span>
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-sky-400">Live GPS: {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2.5 pt-1.5 no-scrollbar scroll-smooth">
          {days.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            const isSevere = day.isSevereMonsoonDay;

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`relative flex-shrink-0 min-w-[72px] sm:min-w-[80px] p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 text-center ${
                  isSevere
                    ? isSelected
                      ? 'bg-gradient-to-b from-amber-900/60 via-slate-800/95 to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/40'
                      : 'bg-gradient-to-b from-amber-950/40 via-[#1c2433] to-[#121c27] border-2 border-amber-500/60 shadow-md shadow-amber-500/15 hover:border-amber-400 hover:from-amber-950/60'
                    : isSelected
                    ? 'bg-slate-800/95 border-2 border-sky-400/80 shadow-lg shadow-sky-500/20'
                    : 'bg-[#152230]/70 border border-slate-700/40 hover:bg-slate-800/60 hover:border-slate-600'
                }`}
              >
                {/* Severe Day Warning Badge on Top */}
                {isSevere ? (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/60 text-[8px] font-black tracking-wider uppercase shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    <span>Severe</span>
                  </div>
                ) : (
                  <div className="h-[17px]" />
                )}

                <span
                  className={`text-xs font-bold block mt-1 ${
                    isSelected
                      ? 'text-white'
                      : isSevere
                      ? 'text-amber-200 font-extrabold'
                      : 'text-slate-300'
                  }`}
                >
                  {day.dayOfWeek}
                </span>

                <div className="my-1.5">
                  <WeatherConditionIcon
                    condition={day.weatherCondition}
                    className={`w-6 h-6 ${
                      isSevere ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' : ''
                    }`}
                  />
                </div>

                <div className="text-[11px] font-bold text-white tracking-tight">
                  {day.tempMax}°<span className="text-slate-400 font-normal">/{day.tempMin}°</span>
                </div>

                <div
                  className={`text-[10px] font-mono mt-0.5 font-bold ${
                    isSevere ? 'text-amber-400' : 'text-sky-400/80'
                  }`}
                >
                  {day.rainProbabilityMax}% Rain
                </div>

                {/* Pill indicator bar under the selected day */}
                <div className="h-1.5 mt-1.5 flex items-center justify-center w-full">
                  {isSelected && (
                    <div
                      className={`h-1 w-6 rounded-full ${
                        isSevere
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                          : 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selected Day Hero Overview */}
      <div className="pt-1 pb-1">
        <div className="text-sm font-semibold text-slate-300">
          {selectedDay.formattedDate}
        </div>
        <div className="flex items-center gap-4 mt-0.5">
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {selectedDay.tempMax}°<span className="text-slate-400 font-normal">/{selectedDay.tempMin}°</span>
          </div>
          <WeatherConditionIcon condition={selectedDay.weatherCondition} className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="text-base sm:text-lg font-medium text-sky-300 mt-0.5">
          {selectedDay.conditionText}
        </div>
      </div>

      {/* 3. Hourly Forecast Horizontal List */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Hourly forecast
        </h4>
        <div className="bg-[#121c27] rounded-2xl p-4 border border-slate-800/80 shadow-inner">
          <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
            {hourlyData.map((h, i) => (
              <div
                key={h.time || i}
                className="flex-shrink-0 min-w-[50px] flex flex-col items-center justify-between text-center space-y-1.5"
              >
                {/* Temperature */}
                <span className="text-sm font-bold text-white">{h.temperature}°</span>

                {/* Rain probability (visible when > 0%) */}
                <span className="text-[10px] font-bold text-sky-400 min-h-[14px]">
                  {h.precipitationProbability > 0 ? `${h.precipitationProbability}%` : ''}
                </span>

                {/* Weather icon */}
                <div className="py-0.5">
                  <WeatherConditionIcon condition={h.weatherCondition} className="w-5 h-5" />
                </div>

                {/* Hour label: 'Now', '8 AM', etc. */}
                <span className="text-[11px] font-medium text-slate-400">{h.hourLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Daily Conditions 2x2 Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Daily conditions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Max Wind */}
          <div className="bg-[#121c27] rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-400">Max wind</span>
            <div className="flex items-center justify-between gap-2 mt-2">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {selectedDay.windSpeedMax} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 capitalize leading-tight">
                  {selectedDay.windDescription}
                </div>
              </div>
              <WindCompassDial deg={selectedDay.windDirectionDeg} />
            </div>
          </div>

          {/* Card 2: Average Humidity */}
          <div className="bg-[#121c27] rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-400">Average humidity</span>
            <div className="flex items-center justify-between gap-2 mt-2">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {selectedDay.avgHumidity}<span className="text-sm font-normal text-slate-400">%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-tight">
                  {selectedDay.avgHumidity > 80 ? 'High moisture' : 'Optimal storage'}
                </div>
              </div>
              <HumidityCapsuleGauge value={selectedDay.avgHumidity} />
            </div>
          </div>

          {/* Card 3: Max UV Index */}
          <div className="bg-[#121c27] rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-400">Max UV Index</span>
            <div className="flex items-center justify-between gap-2 mt-2">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {selectedDay.uvIndexMax}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-tight">
                  {selectedDay.uvDescription}
                </div>
              </div>
              <UvRadialGauge uv={selectedDay.uvIndexMax} />
            </div>
          </div>

          {/* Card 4: Sunrise & Sunset */}
          <div className="bg-[#121c27] rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-400">Sunrise & sunset</span>
            <div className="space-y-1 mt-1">
              <div>
                <div className="text-sm sm:text-base font-bold text-white">{selectedDay.sunrise}</div>
                <div className="text-[10px] text-slate-400">Sunrise</div>
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white">{selectedDay.sunset}</div>
                <div className="text-[10px] text-slate-400">Sunset</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Hourly Details Interactive Pill Bar Chart */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Hourly details
        </h4>
        <div className="bg-[#121c27] rounded-2xl p-4 border border-slate-800/80 shadow-inner space-y-4">
          {/* Tab Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('precipitation')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'precipitation'
                  ? 'bg-slate-700 text-white border border-sky-400/50 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>Precipitation</span>
            </button>

            <button
              onClick={() => setActiveTab('wind')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'wind'
                  ? 'bg-slate-700 text-white border border-teal-400/50 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Wind</span>
            </button>

            <button
              onClick={() => setActiveTab('humidity')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'humidity'
                  ? 'bg-slate-700 text-white border border-amber-400/50 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span>Humidity</span>
            </button>

            <button
              onClick={() => setActiveTab('solar')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'solar'
                  ? 'bg-slate-700 text-white border border-yellow-400/50 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              <span>Solar</span>
            </button>
          </div>

          {/* Metric Summary Badge */}
          <div className="border-b border-slate-800/80 pb-3">
            <span className="text-xs text-slate-400 font-medium block">{tabSummary.title}</span>
            <div className="text-2xl font-black text-white mt-0.5 flex items-baseline gap-2">
              <span>{tabSummary.value}</span>
              <span className="text-xs font-normal text-slate-400">{tabSummary.unit}</span>
            </div>
          </div>

          {/* Pill Bar Chart (Matching Google Weather screenshot) */}
          <div className="pt-2">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar items-end h-44">
              {hourlyData.map((h, idx) => {
                const metric = getHourMetric(h);
                return (
                  <div
                    key={h.time || idx}
                    className="flex-shrink-0 min-w-[42px] flex flex-col items-center justify-end h-full space-y-2"
                  >
                    {/* Top Value Label */}
                    <span className="text-[10px] font-bold text-slate-300">{metric.valText}</span>

                    {/* Vertical Pill Capsule Bar */}
                    <div className="w-6 sm:w-7 flex flex-col justify-end bg-slate-800/50 rounded-full p-0.5 h-28">
                      <div
                        className={`w-full bg-gradient-to-t ${metric.gradient} rounded-full transition-all duration-300 shadow-md`}
                        style={{ height: `${metric.barHeightPct}%` }}
                      />
                    </div>

                    {/* Bottom Hour Label */}
                    <span className="text-[10px] font-medium text-slate-400">{h.hourLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6. SCAB Smart India Hackathon Cold-Storage Adaptation Brain */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900/60 to-slate-900 border border-teal-500/40 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              SCAB AI Microclimate Cold-Storage Strategy
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Automated Optimization
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Strategy Mode</span>
            <span className="font-bold text-white mt-0.5 block">{selectedDay.predictedCoolingStrategy}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Solar PV Generation</span>
            <span className="font-bold text-amber-400 mt-0.5 block">
              {selectedDay.estimatedSolarGenerationKwh} kWh ({selectedDay.solarHoursEstimate} hrs sun)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">NER Farmer Advisory</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">
              {selectedDay.isSevereMonsoonDay
                ? 'Monsoon Storm: Pre-freeze PCM & engage water HX'
                : 'High Solar: Run compressor at 90Hz to bank latent thermal cold'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Standard In-Dashboard Card */}
      <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
        {/* Card Header with 10-day forecast and maximize modal button */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              10-Day Meteorological Forecast
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {upcomingMonsoonDays.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{upcomingMonsoonDays.length} Severe Days Detected by AI</span>
              </div>
            )}

            <button
              onClick={() => setIsFullScreen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Open Google Weather View Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Live Interactive Google Weather Section */}
        {renderDetailContent()}
      </div>

      {/* Google Weather Mobile App Fullscreen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-[#0f1722] overflow-y-auto flex justify-center">
          <div className="w-full max-w-lg min-h-screen bg-[#0f1722] p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Google Weather Top App Bar matching reference photo */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="flex items-center gap-2 text-white hover:text-sky-400 transition-colors p-1 -ml-1 rounded-lg"
                >
                  <ArrowLeft className="w-6 h-6" />
                  <span className="text-lg font-bold">10-day forecast</span>
                </button>
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="mt-3">
                {renderDetailContent()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-6 pb-2 text-center text-xs text-slate-500 font-mono">
              Google Weather Layout Integration • SCAB SIH 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
};

