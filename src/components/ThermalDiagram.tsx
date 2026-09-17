import React from 'react';
import { Snowflake, CloudRain, Mountain, Layers, Zap, Wind } from 'lucide-react';
import { TelemetryData } from '../types/telemetry';
import { AiDecisionResult } from '../types/aiEngine';

interface ThermalDiagramProps {
  telemetry: TelemetryData;
  aiResult?: AiDecisionResult;
}

export const ThermalDiagram: React.FC<ThermalDiagramProps> = ({ telemetry }) => {
  const relays = telemetry.relays;

  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Multi-Stage Thermal Management Ecosystem</span>
          </h3>
          <p className="text-xs text-slate-400">
            Replaces pure compressor cooling with coordinated ground, water, ice, sky, and gas stages.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Energy Source:</span>
          <span className="text-emerald-400 font-bold">
            {relays.pcmDischargeLoop ? '100% Passive Ice' : relays.compressorBackup ? 'Solar Hybrid DC' : 'Earth-Air HX'}
          </span>
        </div>
      </div>

      {/* Grid of the 5 Multi-Stage Cooling Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Stage 1: Earth-Air Heat Exchanger */}
        <div
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
            relays.earthAirFan
              ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-700/50 opacity-80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Stage 1</span>
              <Mountain className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-white mt-1">Earth-Air HX Pre-Cooler</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Pre-cools fresh produce from 35°C to 25°C using buried ground pipes.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400">STATUS:</span>
            <span className={relays.earthAirFan ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {relays.earthAirFan ? 'ACTIVE PRE-COOL' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Stage 2: Rainwater-Cooled Condenser */}
        <div
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
            relays.rainwaterPump
              ? 'bg-gradient-to-b from-blue-950/60 to-slate-900 border-blue-500 shadow-md shadow-blue-500/10'
              : 'bg-slate-900/60 border-slate-700/50 opacity-80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Stage 2</span>
              <CloudRain className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-xs font-bold text-white mt-1">Rainwater Condenser HX</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Dumps condenser heat into harvested rainwater, dropping pressure and boosting COP.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400">STATUS:</span>
            <span className={relays.rainwaterPump ? 'text-blue-400 font-bold' : 'text-slate-500'}>
              {relays.rainwaterPump ? 'COP +38% BOOST' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Stage 3: PCM Ice Thermal Battery */}
        <div
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
            relays.pcmFreezeLoop || relays.pcmDischargeLoop
              ? 'bg-gradient-to-b from-teal-950/60 to-slate-900 border-teal-500 shadow-md shadow-teal-500/10'
              : 'bg-slate-900/60 border-slate-700/50 opacity-80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Stage 3</span>
              <Snowflake className="w-4 h-4 text-teal-400" />
            </div>
            <h4 className="text-xs font-bold text-white mt-1">PCM Ice Thermal Battery</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              120kg ice stores 11.1 kWh thermal energy for 4-5 days of passive preservation.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400">CHARGE:</span>
            <span className="text-teal-300 font-bold">{Math.round(telemetry.pcmChargePercent)}% Frozen</span>
          </div>
        </div>

        {/* Stage 4: Radiative Sky Cooling */}
        <div
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
            relays.radiativeSkyValve
              ? 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 shadow-md shadow-purple-500/10'
              : 'bg-slate-900/60 border-slate-700/50 opacity-80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Stage 4</span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-xs font-bold text-white mt-1">Radiative Sky Cooling</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Rejects heat passively into deep space through 8-13 µm atmospheric window at night.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400">VALVE:</span>
            <span className={relays.radiativeSkyValve ? 'text-purple-300 font-bold' : 'text-slate-500'}>
              {relays.radiativeSkyValve ? 'NIGHT DUMP OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* Stage 5: Controlled Atmosphere N2 */}
        <div
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
            relays.n2SolenoidValve
              ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/60 border-slate-700/50 opacity-80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Stage 5</span>
              <Wind className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="text-xs font-bold text-white mt-1">Controlled Atmosphere N₂</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Intermittent N₂ pulses keep O₂ at 3-5%, slowing crop respiration without hypoxia.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400">O₂ LEVEL:</span>
            <span className="text-cyan-300 font-bold">{telemetry.o2Percent.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
