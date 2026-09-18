import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Moon,
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

// Visual weather condition icon renderer
const WeatherConditionIcon: React.FC<{
  condition: DailyForecast['weatherCondition'];
  className?: string;
}> = ({ condition, className = 'w-6 h-6' }) => {
  switch (condition) {
    case 'Sunny':
      return (
        <div className="relative inline-flex items-center justify-center">
          <Sun className={`${className} text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]`} />
        </div>
      );
    case 'Partly Cloudy':
      return (
        <div className="relative inline-flex items-center justify-center">
          <Sun className="w-5 h-5 text-amber-400 -mr-2 -mt-1" />
          <Cloud className={`${className} text-slate-300 drop-shadow-sm`} />
        </div>
      );
    case 'Heavy Storm':
      return (
        <div className="relative inline-flex items-center justify-center">
          <CloudLightning className={`${className} text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]`} />
        </div>
      );
    case 'Rain / Monsoon':
      return (
        <div className="relative inline-flex items-center justify-center">
          <CloudRain className={`${className} text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]`} />
        </div>
      );
    case 'Clear Sky Night':
      return (
        <div className="relative inline-flex items-center justify-center">
          <Moon className={`${className} text-indigo-300 drop-shadow-[0_0_6px_rgba(165,180,252,0.5)]`} />
        </div>
      );
    default:
      return <Cloud className={`${className} text-slate-400`} />;
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
      <div>
        <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            10-Day Forecast Schedule (Tap any day)
          </span>
          <span className="text-[10px] font-mono text-sky-400">Live GPS: {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {days.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 min-w-[68px] sm:min-w-[74px] p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 text-center ${
                  isSelected
                    ? 'bg-slate-800/95 border-2 border-sky-400/80 shadow-lg shadow-sky-500/20'
                    : 'bg-[#152230]/70 border border-slate-700/40 hover:bg-slate-800/60 hover:border-slate-600'
                }`}
              >
                <span
                  className={`text-xs font-bold block ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {day.dayOfWeek}
                </span>

                <div className="my-1.5">
                  <WeatherConditionIcon condition={day.weatherCondition} className="w-6 h-6" />
                </div>

                <div className="text-[11px] font-bold text-white tracking-tight">
                  {day.tempMax}°<span className="text-slate-400 font-normal">/{day.tempMin}°</span>
                </div>

                {/* Blue pill indicator bar under the selected day, matching Google Weather screenshot */}
                <div className="h-1.5 mt-1 flex items-center justify-center w-full">
                  {isSelected && (
                    <div className="h-1 w-6 bg-sky-400 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
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
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{upcomingMonsoonDays.length} Severe Days</span>
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

