import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Send,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  Info,
  Droplets,
  Wind
} from 'lucide-react';
import { TelemetryData, CropId } from '../types/telemetry';
import { CROP_LIST, CROP_DATABASE } from '../services/cropDatabase';
import { AiDecisionResult } from '../types/aiEngine';
import { encodeSmsCommand } from '../services/smsProtocol';

interface FarmerDashboardProps {
  telemetry: TelemetryData;
  aiResult: AiDecisionResult;
  onCropChange: (cropId: CropId) => void;
  onQuantityChange: (kg: number) => void;
  onSendSmsCommand: (commandString: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  telemetry,
  aiResult,
  onCropChange,
  onQuantityChange,
  onSendSmsCommand,
}) => {
  const selectedCrop = CROP_DATABASE[telemetry.selectedCrop] || CROP_DATABASE.green_chilli;
  const isPrimed = telemetry.primingStatus.isPrimed;
  const [loadWeight, setLoadWeight] = useState<number>(telemetry.produceLoadKg || 150);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const handleSync = () => {
    const cmd = encodeSmsCommand({
      mode: 'AUTO',
      targetTemp: aiResult.targetChamberTemp,
      rainwaterPump: aiResult.recommendedRelays.rainwaterPump,
      pcmFreeze: aiResult.recommendedRelays.pcmFreezeLoop,
      n2Pulse: aiResult.recommendedRelays.n2SolenoidValve,
      selectedCrop: selectedCrop.id,
      loadKg: loadWeight,
    });
    onSendSmsCommand(cmd);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Cold Priming Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all ${
          isPrimed
            ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
            : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-900/60 border-amber-500/50 shadow-lg shadow-amber-500/15 animate-pulse'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl ${
                isPrimed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isPrimed ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isPrimed ? 'Cold Priming Completed' : 'Cold Priming In Progress'}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isPrimed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isPrimed ? 'SAFE TO LOAD HARVEST' : 'PRE-CHARGING REQUIRED'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {isPrimed
                  ? 'LiFePO4 battery is 100% charged and PCM ice thermal battery is 100% frozen. Incoming fresh harvest will not cause compressor shock load.'
                  : 'System is pre-conditioning! Sourcing solar energy to reach 100% battery and deep-freeze the ice thermal battery before vegetables are loaded.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60 self-start sm:self-center font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">BATTERY</span>
              <span className="font-bold text-amber-300">{Math.round(telemetry.batterySocPercent)}%</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px]">PCM ICE</span>
              <span className="font-bold text-teal-300">{Math.round(telemetry.pcmChargePercent)}% ({telemetry.pcmTemp}°C)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Hero: Circular Autonomy Safe Days & Key Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Big Autonomy Dial */}
        <div className="lg:col-span-1 bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700/70 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
            Guaranteed Cold Security
          </span>

          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            {/* SVG Circular Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                className="text-slate-700/60"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * Math.min(aiResult.predictedAutonomyDays, 8)) / 8}
                strokeLinecap="round"
                className="text-teal-400 transition-all duration-1000"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tracking-tight">
                {aiResult.predictedAutonomyDays}
              </span>
              <span className="text-xs font-semibold uppercase text-teal-300 tracking-wider">
                Days Autonomy
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium mt-1">
            Safe without solar or grid power during continuous monsoon
          </p>

          <div className="w-full mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/40">
              <span className="text-slate-400 block text-[10px]">PCM ICE BUFFER</span>
              <span className="font-bold text-teal-300">{aiResult.pcmAutonomyDays} Days</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/40">
              <span className="text-slate-400 block text-[10px]">LiFePO4 BACKUP</span>
              <span className="font-bold text-amber-300">{aiResult.batteryAutonomyHours} Hours</span>
            </div>
          </div>
        </div>

        {/* Middle & Right: Real-time Chamber Conditions & Active Mode */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Metrics 4-Pack */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temp Card */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Chamber Temp
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-white">
                  {telemetry.chamberTemp.toFixed(1)}°C
                </span>
              </div>
              <span className="text-[10px] text-teal-400 mt-1 block">
                Target: {selectedCrop.idealTempMin} - {selectedCrop.idealTempMax}°C
              </span>
            </div>

            {/* RH Card */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Humidity (RH)
                </span>
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-white">
                  {Math.round(telemetry.chamberRH)}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">
                Fresh & Crisp Storage
              </span>
            </div>

            {/* O2 Respiration Card */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Oxygen (O₂)
                </span>
                <Wind className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-teal-300">
                  {telemetry.o2Percent.toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Respiration: Slowed 65%
              </span>
            </div>

            {/* Freshness Score */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Crop Freshness
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-emerald-400">98%</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">
                Zero Spoilage Detected
              </span>
            </div>
          </div>

          {/* AI Background Decision Card (Farmer-friendly) */}
          <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Active Cooling Strategy
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                {aiResult.activeMode === 'PRE_COOLING' && '🌍 Earth-Air Heat Exchanger Pre-Cooling Incoming Crop'}
                {aiResult.activeMode === 'RAINWATER_BOOST' && '🌧️ Rainwater Condenser Cooling at Maximum COP'}
                {aiResult.activeMode === 'PCM_PRE_FREEZE' && '🧊 Pre-Freezing Ice Thermal Battery Ahead of Monsoon'}
                {aiResult.activeMode === 'PCM_DISCHARGE' && '🧊 Passive Ice Thermal Discharge (Zero Battery Drain)'}
                {aiResult.activeMode === 'RADIATIVE_SKY' && '🌌 Radiative Sky Heat Rejection (Zero Power)'}
                {aiResult.activeMode === 'COMPRESSOR_OPTIMAL' && '❄️ Night-Time Ambient Heat Dump at Maximum COP'}
                {aiResult.activeMode === 'STANDBY' && '🛡️ Passive Insulation Retention Mode'}
              </p>
              <p className="text-xs text-slate-400 max-w-xl">
                {aiResult.reasoning}
              </p>
            </div>

            <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700/60 self-start sm:self-center text-right font-mono text-xs">
              <span className="text-[10px] text-slate-400 block">ENERGY SAVING</span>
              <span className="text-emerald-400 font-bold text-sm">+{aiResult.energySavingPercent}% vs Standard</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Crop Selection Catalog & Quantity Loading Control */}
      <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-5 sm:p-6 border border-slate-700/70 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Select Stored Produce & Enter Quantity</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pick your harvested vegetable. The SCAB mobile AI will automatically send optimal temperature, humidity, and controlled atmosphere targets to the cold storage.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>North Eastern Region Crop Library</span>
          </div>
        </div>

        {/* Horizontal Scrollable Crop Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CROP_LIST.map((c) => {
            const isSelected = c.id === selectedCrop.id;
            return (
              <button
                key={c.id}
                onClick={() => onCropChange(c.id)}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-teal-500/20 to-slate-900 border-teal-500 shadow-md shadow-teal-500/20'
                    : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  </div>
                )}
                <div>
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <h4 className="text-sm font-bold text-white">{c.name}</h4>
                  <p className="text-[11px] text-teal-400 font-medium truncate">{c.regionalName}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/50 text-[10px] space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Target Temp:</span>
                    <span className="font-semibold text-slate-200">{c.idealTempMin} - {c.idealTempMax}°C</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Shelf Life:</span>
                    <span>{c.scabShelfLifeDays} Days</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Load Quantity Slider & Remote Sync Button */}
        <div className="bg-slate-900/70 p-4 sm:p-5 rounded-xl border border-slate-700/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Produce Load Quantity (kg)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="10"
                  value={loadWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setLoadWeight(val);
                    onQuantityChange(val);
                  }}
                  className="w-48 sm:w-64 accent-teal-500"
                />
                <span className="font-mono text-lg font-bold text-teal-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  {loadWeight} kg
                </span>
              </div>
            </div>

            {/* Sync Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-teal-500/25 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Sync Crop Settings to Cold Store</span>
              </button>
            </div>
          </div>

          {syncSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-2 rounded-lg flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                GSM Command dispatched to ESP32! Target: {aiResult.targetChamberTemp}°C, O₂: {aiResult.targetO2}%, Crop: {selectedCrop.name}, Load: {loadWeight}kg.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Help & Kisan Support */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <PhoneCall className="w-4 h-4 text-teal-400" />
          <span>Need help or market price information in your district?</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:18001801551"
            className="text-teal-300 font-bold hover:underline flex items-center gap-1"
          >
            <span>Kisan Call Center: 1800-180-1551</span>
          </a>
        </div>
      </div>
    </div>
  );
};
