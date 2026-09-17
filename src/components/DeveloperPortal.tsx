import React, { useState } from 'react';
import {
  Cpu,
  Sliders,
  Play,
  RotateCcw,
  Activity,
  Zap,
  TrendingUp,
  Table,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Layers,
  CloudSun
} from 'lucide-react';
import { TelemetryData, RelayStates } from '../types/telemetry';
import { WeatherData } from '../types/weather';
import {
  AiOptimizationWeights,
  AiDecisionResult,
  DeveloperAiState,
} from '../types/aiEngine';
import { trainAiModelStep } from '../services/aiDecisionEngine';

interface DeveloperPortalProps {
  telemetry: TelemetryData;
  weather: WeatherData;
  aiResult: AiDecisionResult;
  aiState: DeveloperAiState;
  onUpdateWeights: (weights: AiOptimizationWeights) => void;
  onSetAiState: React.Dispatch<React.SetStateAction<DeveloperAiState>>;
  onToggleRelay: (relayKey: keyof RelayStates) => void;
  onInjectSms: (sms: string) => void;
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({
  telemetry,
  weather,
  aiResult,
  aiState,
  onUpdateWeights,
  onSetAiState,
  onToggleRelay,
  onInjectSms,
}) => {
  const [activeTab, setActiveTab] = useState<'tuning' | 'matrix' | 'thermo' | 'relays' | 'terminal'>('tuning');
  const [filterDay, setFilterDay] = useState<number>(1);
  const [terminalInput, setTerminalInput] = useState<string>('');

  const weights = aiState.weights;

  const handleSliderChange = (key: keyof AiOptimizationWeights, val: number) => {
    const updated = { ...weights, [key]: val };
    onUpdateWeights(updated);
  };

  const handleTrainStep = () => {
    const { newWeights, log } = trainAiModelStep(weights, aiState.trainingEpoch);
    onSetAiState((prev) => ({
      ...prev,
      weights: newWeights,
      trainingEpoch: prev.trainingEpoch + 1,
      trainingHistory: [...prev.trainingHistory, log],
      totalSimulationsRun: prev.totalSimulationsRun + 1,
    }));
  };

  const handleResetWeights = () => {
    onUpdateWeights({
      weightSolarPreference: 0.9,
      weightPcmPreservation: 0.85,
      weightRainwaterCOP: 0.8,
      weightRadiativeSky: 0.75,
      weightCompressorAvoidance: 0.9,
      batterySafetyThreshold: 20,
      preFreezingHorizonHours: 36,
    });
  };

  const filteredSchedule = aiResult.tenDaySchedule.filter(
    (item) => Math.floor(item.hourIndex / 24) + 1 === filterDay
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Developer & Model Telemetry */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 rounded-2xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">SCAB AI Edge Training Portal</h2>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                Developer Mode
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Reinforcement Learning & Thermal Dispatch Policy Optimizer • Version 2.4-Edge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-right">
            <span className="text-[10px] text-slate-400 block">TRAINING EPOCHS</span>
            <span className="text-indigo-300 font-bold">{aiState.trainingEpoch}</span>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-right">
            <span className="text-[10px] text-slate-400 block">POLICY REWARD</span>
            <span className="text-emerald-400 font-bold">
              {aiState.trainingHistory[aiState.trainingHistory.length - 1]?.rewardValue ?? 88.4}%
            </span>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-right">
            <span className="text-[10px] text-slate-400 block">LOCAL AMBIENT</span>
            <span className="text-teal-300 font-bold flex items-center gap-1">
              <CloudSun className="w-3 h-3" />
              {weather.currentTemp}°C
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'tuning', label: 'Hyperparameters & Training', icon: Sliders },
          { id: 'matrix', label: '10-Day Decision Matrix', icon: Table },
          { id: 'thermo', label: 'Thermodynamics & COP', icon: TrendingUp },
          { id: 'relays', label: 'Hardware Relays', icon: Layers },
          { id: 'terminal', label: 'GSM / SMS Terminal', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Hyperparameters & Training */}
      {activeTab === 'tuning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Card */}
          <div className="lg:col-span-2 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Objective Cost Function Weights</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tune how the AI prioritizes direct PV, ice thermal storage, rainwater cooling, and ambient compressor scheduling.
                </p>
              </div>

              <button
                onClick={handleResetWeights}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700/50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Slider 1: Solar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Solar PV Direct Utilization (w₁)</span>
                  <span className="font-mono text-amber-400">{weights.weightSolarPreference.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={weights.weightSolarPreference}
                  onChange={(e) => handleSliderChange('weightSolarPreference', parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Slider 2: PCM */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">PCM Ice Thermal Battery Preservation (w₂)</span>
                  <span className="font-mono text-teal-400">{weights.weightPcmPreservation.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={weights.weightPcmPreservation}
                  onChange={(e) => handleSliderChange('weightPcmPreservation', parseFloat(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>

              {/* Slider 3: Rainwater */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Rainwater Condenser Subcooling Weight (w₃)</span>
                  <span className="font-mono text-blue-400">{weights.weightRainwaterCOP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={weights.weightRainwaterCOP}
                  onChange={(e) => handleSliderChange('weightRainwaterCOP', parseFloat(e.target.value))}
                  className="w-full accent-blue-400"
                />
              </div>

              {/* Slider 4: Radiative Sky */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Radiative Sky Cooling Exploitation (w₄)</span>
                  <span className="font-mono text-purple-400">{weights.weightRadiativeSky.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={weights.weightRadiativeSky}
                  onChange={(e) => handleSliderChange('weightRadiativeSky', parseFloat(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              {/* Slider 5: Compressor Avoidance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">High Ambient Heat Compressor Penalty (w₅)</span>
                  <span className="font-mono text-rose-400">{weights.weightCompressorAvoidance.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={weights.weightCompressorAvoidance}
                  onChange={(e) => handleSliderChange('weightCompressorAvoidance', parseFloat(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              {/* Lookahead Horizon */}
              <div className="space-y-1 pt-2 border-t border-slate-700/50">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Monsoon Pre-Freezing Lookahead Horizon</span>
                  <span className="font-mono text-emerald-400">{weights.preFreezingHorizonHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="6"
                  value={weights.preFreezingHorizonHours}
                  onChange={(e) => handleSliderChange('preFreezingHorizonHours', parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-700/60">
              <button
                onClick={handleTrainStep}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute 1 Training Epoch</span>
              </button>
            </div>
          </div>

          {/* Training Loss & Reward Curves */}
          <div className="lg:col-span-1 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Training Convergence Logs</span>
              </h3>
              <p className="text-xs text-slate-400">
                Energy loss minimizing toward zero-waste boundary.
              </p>

              {/* Training History List */}
              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                {aiState.trainingHistory.map((item) => (
                  <div
                    key={item.epoch}
                    className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-700/50 font-mono text-[11px] space-y-1"
                  >
                    <div className="flex justify-between text-slate-400">
                      <span className="text-indigo-400 font-bold">Epoch #{item.epoch}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Loss: {item.lossValue}</span>
                      <span className="text-emerald-400 font-semibold">Reward: {item.rewardValue}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-xs">
              <span className="text-slate-400 block text-[10px]">OPTIMIZATION CRITERION</span>
              <p className="font-mono text-slate-300 text-[11px] mt-0.5">
                min J = ∑ [w₁P_solar + w₂ΔT_pcm - w₃η_rain - w₄Φ_sky + w₅P_comp]
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10-Day Decision Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">10-Day Predictive Schedule Matrix</h3>
              <p className="text-xs text-slate-400">
                Hourly dispatch decisions generated by the SCAB Brain using the 10-day weather forecast.
              </p>
            </div>

            {/* Day Selector Tabs (1 to 10) */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700 overflow-x-auto max-w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDay(d)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                    filterDay === d
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Amb Temp</th>
                  <th className="p-2.5">Solar (W)</th>
                  <th className="p-2.5">Rain %</th>
                  <th className="p-2.5">AI Scheduled Action</th>
                  <th className="p-2.5">Battery %</th>
                  <th className="p-2.5">PCM %</th>
                  <th className="p-2.5">Est COP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filteredSchedule.map((row) => (
                  <tr key={row.hourIndex} className="hover:bg-slate-700/30">
                    <td className="p-2.5 text-slate-300 font-semibold">{row.timeLabel}</td>
                    <td className="p-2.5 text-slate-200">{row.ambientTemp}°C</td>
                    <td className="p-2.5 text-amber-300">{row.solarWatts}W</td>
                    <td className="p-2.5 text-blue-300">{row.rainProb}%</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.recommendedAction === 'PCM_PRE_FREEZE'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : row.recommendedAction === 'PCM_PASSIVE_DISCHARGE'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : row.recommendedAction === 'RADIATIVE_SKY_COOLING'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : row.recommendedAction === 'COMPRESSOR_NIGHT_DUMP'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-700/40 text-slate-400'
                        }`}
                      >
                        {row.recommendedAction}
                      </span>
                    </td>
                    <td className="p-2.5 text-amber-400">{row.projectedBatterySoc}%</td>
                    <td className="p-2.5 text-teal-300">{row.projectedPcmCharge}%</td>
                    <td className="p-2.5 text-emerald-400 font-bold">{row.copEstimated.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Thermodynamics & COP */}
      {activeTab === 'thermo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COP Analysis Card */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Thermodynamic COP Comparison</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-700/50 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block">CONVENTIONAL COMPRESSOR</span>
                  <span className="text-sm font-semibold text-slate-300">Direct Air Heat Rejection (40°C air)</span>
                </div>
                <span className="font-mono text-xl font-bold text-slate-400">COP: {aiResult.copConventional}</span>
              </div>

              <div className="p-3.5 bg-slate-900/70 rounded-xl border border-teal-500/40 flex justify-between items-center">
                <div>
                  <span className="text-xs text-teal-400 font-bold block">SCAB ADAPTIVE HYBRID</span>
                  <span className="text-sm font-semibold text-white">Rainwater Condenser + Night Dump + PCM</span>
                </div>
                <span className="font-mono text-xl font-bold text-teal-300">COP: {aiResult.copHybrid}</span>
              </div>
            </div>

            <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs space-y-2 text-teal-200">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>COP Boost of +{Math.round(((aiResult.copHybrid - aiResult.copConventional)/aiResult.copConventional)*100)}%</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                By circulating harvested rainwater over the condenser, condensing temperature drops by 12–15°C, reducing compressor discharge pressure ratio and dramatically increasing thermodynamic efficiency.
              </p>
            </div>
          </div>

          {/* Energy Savings SIH Metric */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>SIH Hackathon Energy Savings Proof</span>
            </h3>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 font-mono text-center">
              <span className="text-xs text-slate-400 block mb-1">ENERGY SAVING FORMULA</span>
              <span className="text-sm font-bold text-white">
                % Energy Saving = [(E_conv - E_hybrid) / E_conv] × 100
              </span>
              <div className="mt-3 text-3xl font-black text-emerald-400">
                {aiResult.energySavingPercent}% SAVINGS
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block text-[10px]">CONVENTIONAL LOAD</span>
                <span className="text-slate-200 font-bold">3.60 kWh / day</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-teal-500/30">
                <span className="text-teal-400 block text-[10px]">SCAB HYBRID LOAD</span>
                <span className="text-teal-300 font-bold">0.82 kWh / day</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hardware Relays */}
      {activeTab === 'relays' && (
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>ESP32 Multi-Channel Relay Override Switchboard</span>
            </h3>
            <p className="text-xs text-slate-400">
              Manual actuation override for bench testing during hackathon jury demonstration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {([
              { key: 'earthAirFan', label: 'Earth-Air Pre-Cool Fan', stage: 'Stage 1' },
              { key: 'rainwaterPump', label: 'Rainwater Condenser Pump', stage: 'Stage 2' },
              { key: 'pcmFreezeLoop', label: 'PCM Solar Freeze Valve', stage: 'Stage 3' },
              { key: 'pcmDischargeLoop', label: 'PCM Passive Discharge Valve', stage: 'Stage 3' },
              { key: 'radiativeSkyValve', label: 'Radiative Sky Cooling Loop', stage: 'Stage 4' },
              { key: 'n2SolenoidValve', label: 'N₂ Atmosphere Solenoid', stage: 'Stage 5' },
              { key: 'ventDamper', label: 'Chamber Purge Damper', stage: 'Safety' },
              { key: 'compressorBackup', label: 'DC Variable Compressor', stage: 'Refrig' },
              { key: 'safetyDoorLock', label: 'Safety Asphyxiation Door Lock', stage: 'Safety' },
            ] as Array<{ key: keyof RelayStates; label: string; stage: string }>).map((r) => {
              const isOn = telemetry.relays[r.key];
              return (
                <div
                  key={r.key}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isOn
                      ? 'bg-teal-950/50 border-teal-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                      {r.stage}
                    </span>
                    <h4 className="text-xs font-semibold">{r.label}</h4>
                  </div>
                  <button
                    onClick={() => onToggleRelay(r.key)}
                    className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {isOn ? (
                      <ToggleRight className="w-8 h-8 text-teal-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: GSM / SMS Terminal */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>SIM800L V2 GSM & GPS Telemetry Console</span>
            </h3>
            <p className="text-xs text-slate-400">
              Inject raw SMS packets to test two-way communication between mobile app and ESP32.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 space-y-2 border border-slate-800 max-h-60 overflow-y-auto">
            <div>[SIM800L] +CMTI: &quot;SM&quot;, 1</div>
            <div>[RECV SMS] $SCAB,LAT={telemetry.gps.latitude.toFixed(4)},LON={telemetry.gps.longitude.toFixed(4)},TC={telemetry.chamberTemp.toFixed(1)},RH={telemetry.chamberRH.toFixed(0)},O2={telemetry.o2Percent.toFixed(1)},BAT={telemetry.batterySocPercent.toFixed(0)},PCM={telemetry.pcmChargePercent.toFixed(0)},CROP={telemetry.selectedCrop}#</div>
            <div>[DECODE] Telemetry decoded. Cold Priming = {telemetry.primingStatus.isPrimed ? 'READY' : 'CHARGING'}.</div>
            <div>[AI ENGINE] Optimization completed. Mode = {aiResult.activeMode}. Autonomy = {aiResult.predictedAutonomyDays} Days.</div>
            <div className="text-teal-300">[DISPATCH CMD] CMD,MODE=AUTO,T_SET={aiResult.targetChamberTemp.toFixed(1)},RAIN={aiResult.recommendedRelays.rainwaterPump ? '1' : '0'},PCM={aiResult.recommendedRelays.pcmFreezeLoop ? '1' : '0'}#</div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste raw SMS string: $SCAB,LAT=...,TC=...#"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => {
                if (terminalInput.trim()) {
                  onInjectSms(terminalInput.trim());
                  setTerminalInput('');
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Inject SMS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
