import React from 'react';
import { Wind, ShieldAlert, ShieldCheck, Lock, Unlock } from 'lucide-react';
import { TelemetryData } from '../types/telemetry';
import { AiDecisionResult } from '../types/aiEngine';
import { CROP_DATABASE } from '../services/cropDatabase';

interface ControlledAtmoCardProps {
  telemetry: TelemetryData;
  aiResult?: AiDecisionResult;
}

export const ControlledAtmoCard: React.FC<ControlledAtmoCardProps> = ({ telemetry }) => {
  const crop = CROP_DATABASE[telemetry.selectedCrop] || CROP_DATABASE.green_chilli;
  const isO2Unsafe = telemetry.o2Percent < 18.0;

  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>Smart Controlled-Atmosphere (CA) & Gas Regulation</span>
          </h3>
          <p className="text-xs text-slate-400">
            Intermittent N₂ dosing retards produce respiration (O₂ + organic reserves → CO₂ + water + heat).
          </p>
        </div>

        {/* Human Safety Asphyxiation Interlock Status */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isO2Unsafe
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
        >
          {isO2Unsafe ? (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <Lock className="w-3.5 h-3.5" />
              <span>DOOR LOCKED: O₂ &lt; 18% (ASPHYXIATION RISK)</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <Unlock className="w-3.5 h-3.5" />
              <span>DOOR SAFE FOR ENTRY</span>
            </>
          )}
        </div>
      </div>

      {/* Gas Concentration Dials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Oxygen (O2) */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/50 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Oxygen (O₂)</span>
            <span className="text-cyan-400 font-mono font-bold">
              Target: {crop.idealO2Min}% - {crop.idealO2Max}%
            </span>
          </div>
          <div className="text-3xl font-black text-cyan-300 font-mono">
            {telemetry.o2Percent.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-400">
            Air is 21% O₂. Controlled lower oxygen reduces decay rate by ~65%.
          </p>
        </div>

        {/* Carbon Dioxide (CO2) */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/50 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Carbon Dioxide (CO₂)</span>
            <span className="text-purple-400 font-mono font-bold">
              Limit: &lt; {crop.maxCO2Limit}%
            </span>
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono">
            {telemetry.co2Percent.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-400">
            Maintained below physiological tolerance limit to prevent tissue injury.
          </p>
        </div>

        {/* Nitrogen (N2) */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/50 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Nitrogen (N₂) Buffer</span>
            <span className="text-emerald-400 font-mono font-bold">Inert Carrier</span>
          </div>
          <div className="text-3xl font-black text-emerald-300 font-mono">
            {(100 - telemetry.o2Percent - telemetry.co2Percent).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-400">
            Intermittent PSA/membrane dosing replaces consumed oxygen safely.
          </p>
        </div>
      </div>
    </div>
  );
};
