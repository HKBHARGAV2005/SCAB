import React from 'react';
import { ShieldCheck, Cpu, User, BatteryCharging, Snowflake, Radio, MapPin, AlertTriangle } from 'lucide-react';
import { TelemetryData } from '../types/telemetry';

interface HeaderNavProps {
  currentMode: 'farmer' | 'developer';
  onModeChange: (mode: 'farmer' | 'developer') => void;
  telemetry: TelemetryData;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentMode,
  onModeChange,
  telemetry,
}) => {
  const isPrimed = telemetry.primingStatus.isPrimed;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-teal-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white">SCAB</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded">
                SIH 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Solar Cold-storage Adaptive Brain • North Eastern Region
            </p>
          </div>
        </div>

        {/* Live Status Indicators (Battery, PCM, GSM, Priming) */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
          {/* Cold Priming Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${
              isPrimed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
            }`}
          >
            {isPrimed ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PRIMED (100% READY)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PRIMING IN PROGRESS</span>
              </>
            )}
          </div>

          {/* Battery SOC */}
          <div className="hidden md:flex items-center gap-1 text-slate-300 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/50">
            <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
            <span>{Math.round(telemetry.batterySocPercent)}%</span>
          </div>

          {/* PCM Ice Status */}
          <div className="hidden md:flex items-center gap-1 text-slate-300 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/50">
            <Snowflake className="w-3.5 h-3.5 text-teal-400" />
            <span>{Math.round(telemetry.pcmChargePercent)}% Ice</span>
          </div>

          {/* GSM & Location */}
          <div className="hidden lg:flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/50">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{telemetry.gps.locationName}</span>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onModeChange('farmer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'farmer'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Farmer View</span>
            </button>

            <button
              onClick={() => onModeChange('developer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'developer'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Developer / AI</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
