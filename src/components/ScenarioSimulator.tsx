import React from 'react';
import { Play, Sparkles, CloudRain, Sun, Moon, AlertTriangle, Wind } from 'lucide-react';
import { TelemetryData } from '../types/telemetry';

interface ScenarioSimulatorProps {
  onApplyScenario: (scenarioTelemetry: Partial<TelemetryData>) => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ onApplyScenario }) => {
  const scenarios = [
    {
      id: 'cherrapunji_monsoon',
      title: '6-Day Monsoon Downpour (Cherrapunji)',
      description: 'Zero solar (35W), 95% rain. Proves 7.8 days autonomy using pre-frozen PCM ice battery.',
      icon: CloudRain,
      color: 'from-blue-600 to-indigo-700',
      data: {
        solarPowerWatts: 35,
        batterySocPercent: 92,
        pcmChargePercent: 95,
        pcmTemp: -1.2,
        chamberTemp: 7.2,
        chamberRH: 96,
        o2Percent: 4.0,
        co2Percent: 3.2,
        primingStatus: {
          isPrimed: true,
          batterySoc: 92,
          pcmFreezePercent: 95,
          pcmTemp: -1.2,
          readyForLoading: true,
          statusMessage: 'Cold Priming verified. Operating on pre-frozen PCM ice buffer during monsoon.',
        },
        relays: {
          earthAirFan: true,
          rainwaterPump: false,
          pcmFreezeLoop: false,
          pcmDischargeLoop: true, // Discharging ice passively
          radiativeSkyValve: false,
          n2SolenoidValve: false,
          ventDamper: false,
          compressorBackup: false, // Compressor OFF! Zero electricity drain
          auxPeltier: false,
          safetyDoorLock: false,
        },
        coolingMode: 'PCM_DISCHARGE' as const,
      },
    },
    {
      id: 'sunny_assam',
      title: 'Peak Solar & Priming (Jorhat, Assam)',
      description: 'Solar 520W. 100% battery & PCM ice charging before vegetables enter.',
      icon: Sun,
      color: 'from-amber-500 to-orange-600',
      data: {
        solarPowerWatts: 520,
        batterySocPercent: 100,
        pcmChargePercent: 100,
        pcmTemp: -2.0,
        chamberTemp: 6.8,
        chamberRH: 88,
        o2Percent: 4.5,
        co2Percent: 2.8,
        primingStatus: {
          isPrimed: true,
          batterySoc: 100,
          pcmFreezePercent: 100,
          pcmTemp: -2.0,
          readyForLoading: true,
          statusMessage: '100% Primed & Ready for harvest loading. Zero compressor thermal shock risk.',
        },
        relays: {
          earthAirFan: false,
          rainwaterPump: true,
          pcmFreezeLoop: true,
          pcmDischargeLoop: false,
          radiativeSkyValve: false,
          n2SolenoidValve: false,
          ventDamper: false,
          compressorBackup: false,
          auxPeltier: false,
          safetyDoorLock: false,
        },
        coolingMode: 'RAINWATER_BOOST' as const,
      },
    },
    {
      id: 'tawang_radiative',
      title: 'Night Radiative Sky Cooling (Tawang, Arunachal)',
      description: 'Clear night sky at 3000m altitude. 8-13 µm radiation dumps heat into outer space.',
      icon: Moon,
      color: 'from-purple-600 to-indigo-800',
      data: {
        solarPowerWatts: 0,
        batterySocPercent: 88,
        pcmChargePercent: 92,
        pcmTemp: -0.8,
        chamberTemp: 5.5,
        chamberRH: 90,
        o2Percent: 3.8,
        co2Percent: 3.0,
        relays: {
          earthAirFan: false,
          rainwaterPump: false,
          pcmFreezeLoop: false,
          pcmDischargeLoop: false,
          radiativeSkyValve: true, // Passive night radiation
          n2SolenoidValve: false,
          ventDamper: false,
          compressorBackup: false,
          auxPeltier: false,
          safetyDoorLock: false,
        },
        coolingMode: 'RADIATIVE_SKY' as const,
      },
    },
    {
      id: 'fresh_harvest_load',
      title: 'Fresh Produce Shock Load Buffer (250 kg)',
      description: '250 kg fresh harvest loaded at 36°C. Earth-Air HX absorbs sensible heat without compressor stall.',
      icon: AlertTriangle,
      color: 'from-emerald-600 to-teal-700',
      data: {
        chamberTemp: 14.5,
        chamberRH: 94,
        produceLoadKg: 250,
        solarPowerWatts: 410,
        batterySocPercent: 95,
        pcmChargePercent: 96,
        relays: {
          earthAirFan: true, // Earth-Air Pre-cooling absorbs sensible heat
          rainwaterPump: true,
          pcmFreezeLoop: false,
          pcmDischargeLoop: true,
          radiativeSkyValve: false,
          n2SolenoidValve: false,
          ventDamper: false,
          compressorBackup: true,
          auxPeltier: false,
          safetyDoorLock: false,
        },
        coolingMode: 'PRE_COOLING' as const,
      },
    },
    {
      id: 'n2_safety_interlock',
      title: 'Controlled Atmosphere & Safety Interlock',
      description: 'O₂ dropped to 14.2% via N₂ pulse. Proves audio-visual alarm and door lock interlock for human safety.',
      icon: Wind,
      color: 'from-rose-600 to-pink-700',
      data: {
        o2Percent: 14.2, // Under 18%!
        co2Percent: 3.8,
        chamberTemp: 7.0,
        chamberRH: 92,
        relays: {
          earthAirFan: false,
          rainwaterPump: false,
          pcmFreezeLoop: false,
          pcmDischargeLoop: false,
          radiativeSkyValve: false,
          n2SolenoidValve: true,
          ventDamper: true,
          compressorBackup: false,
          auxPeltier: false,
          safetyDoorLock: true, // Human safety lock engaged!
        },
      },
    },
  ];

  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>SIH 2026 Jury Presentation Scenario Injector</span>
          </h3>
          <p className="text-xs text-slate-400">
            One-click demonstration presets to prove multi-day autonomy, monsoon resistance, and adaptive cooling to the judges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              onClick={() => onApplyScenario(sc.data)}
              className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-700/40 border border-slate-700/60 hover:border-slate-500 transition-all text-left flex flex-col justify-between group active:scale-98"
            >
              <div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sc.color} flex items-center justify-center text-white mb-2 shadow`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                  {sc.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {sc.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] font-bold text-teal-400">
                <Play className="w-3 h-3 fill-current" />
                <span>Inject Scenario</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
