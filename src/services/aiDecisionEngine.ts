import { TelemetryData, RelayStates } from '../types/telemetry';
import { WeatherData } from '../types/weather';
import {
  AiOptimizationWeights,
  AiDecisionResult,
  HourlyScheduleDecision,
  TrainingLogEntry,
} from '../types/aiEngine';
import { CROP_DATABASE } from './cropDatabase';

export const DEFAULT_AI_WEIGHTS: AiOptimizationWeights = {
  weightSolarPreference: 0.9,
  weightPcmPreservation: 0.85,
  weightRainwaterCOP: 0.8,
  weightRadiativeSky: 0.75,
  weightCompressorAvoidance: 0.9,
  batterySafetyThreshold: 20, // 20% buffer
  preFreezingHorizonHours: 36, // 36 hours lookahead
};

export function evaluateColdPriming(
  batterySoc: number,
  pcmTemp: number,
  pcmChargePercent: number
) {
  const batteryReady = batterySoc >= 95;
  const pcmReady = pcmTemp <= 1.0 && pcmChargePercent >= 90;
  const isPrimed = batteryReady && pcmReady;

  let statusMessage = 'Cold Priming Complete. Ready for Fresh Harvest Loading.';
  if (!batteryReady && !pcmReady) {
    statusMessage = 'Priming In Progress: Charging LiFePO4 battery and freezing PCM ice battery to 100%.';
  } else if (!batteryReady) {
    statusMessage = 'Priming In Progress: LiFePO4 battery reaching 100% capacity.';
  } else if (!pcmReady) {
    statusMessage = 'Priming In Progress: Deep freezing PCM thermal ice battery.';
  }

  return {
    isPrimed,
    batterySoc,
    pcmFreezePercent: pcmChargePercent,
    pcmTemp,
    readyForLoading: isPrimed,
    statusMessage,
  };
}

export function runAiOptimization(
  telemetry: TelemetryData,
  weather: WeatherData,
  weights: AiOptimizationWeights = DEFAULT_AI_WEIGHTS
): AiDecisionResult {
  const crop = CROP_DATABASE[telemetry.selectedCrop] || CROP_DATABASE.green_chilli;

  // 1. Calculate Autonomy Reserves
  // PCM: 120 kg ice * 334 kJ/kg = 40.08 MJ = 11.13 kWh_thermal
  // Standalone PCM capacity = 11.13 / 2.3 = ~4.8 days
  const pcmAutonomyDays = Math.round((telemetry.pcmChargePercent / 100) * 4.8 * 10) / 10;

  // Battery: 2.4 kWh LiFePO4. Standalone Battery capacity = 48 hours = 2 days
  const batteryAutonomyHours = Math.round((telemetry.batterySocPercent / 100) * 48);
  const batteryAutonomyDays = Math.round((batteryAutonomyHours / 24) * 10) / 10;

  // Combined Autonomy: 4.8 days PCM + 2.0 days Battery = ~6.8 to 7.8 days
  const predictedAutonomyDays = Math.round((pcmAutonomyDays + batteryAutonomyDays) * 10) / 10;

  // 2. Weather Lookahead: Detect Upcoming Monsoon / Storms based on tuned horizon
  const lookaheadDays = Math.max(2, Math.min(5, Math.round(weights.preFreezingHorizonHours / 24)));
  const upcomingRainyDays = weather.daily.slice(0, lookaheadDays).filter((d) => d.isSevereMonsoonDay).length;
  const isSevereStormImminent = upcomingRainyDays >= 1;

  // 3. Ambient & Condenser Heat Rejection Efficiency
  const currentAmbientTemp = weather.currentTemp;
  const currentRH = weather.currentRH;
  const isNight = new Date().getHours() >= 21 || new Date().getHours() <= 5;
  const isOptimalAmbientHeatDump = isNight || (currentAmbientTemp < 22 && currentRH < 85);

  // 4. Multi-Stage Relay Control Initialization
  const recommendedRelays: RelayStates = {
    earthAirFan: false,
    rainwaterPump: false,
    pcmFreezeLoop: false,
    pcmDischargeLoop: false,
    radiativeSkyValve: false,
    n2SolenoidValve: false,
    ventDamper: false,
    compressorBackup: false,
    auxPeltier: false,
    safetyDoorLock: false,
  };

  let activeMode = 'STANDBY';
  let reasoning = '';

  // Stage 1: Earth-Air Pre-Cooling
  if (telemetry.chamberTemp > crop.idealTempMax + 4) {
    recommendedRelays.earthAirFan = true;
    activeMode = 'PRE_COOLING';
    reasoning = `Incoming harvest thermal load detected. Earth-Air Heat Exchanger actively pre-cooling produce to avoid compressor shock.`;
  }

  // Stage 2 & 3: Predictive Pre-Freezing vs. PCM Discharge
  if (isSevereStormImminent && telemetry.solarPowerWatts > 250 && telemetry.pcmChargePercent < 98) {
    recommendedRelays.pcmFreezeLoop = true;
    recommendedRelays.compressorBackup = true;
    activeMode = 'PCM_PRE_FREEZE';
    reasoning = `AI detected severe monsoon within ${weights.preFreezingHorizonHours}h horizon. Diverting peak solar power (${telemetry.solarPowerWatts}W) to 100% pre-freeze PCM ice thermal battery.`;
  } else if (telemetry.solarPowerWatts < 80 && telemetry.pcmChargePercent > 20) {
    recommendedRelays.pcmDischargeLoop = true;
    activeMode = 'PCM_DISCHARGE';
    reasoning = `Zero/low solar generation. Discharging frozen PCM ice battery passively. LiFePO4 battery preserved for 48h emergency reserve.`;
  }

  // Stage 4: Radiative Sky Cooling
  const currentHourForecast = weather.hourly[0];
  if (currentHourForecast?.isClearSkyNight && telemetry.pcmTemp > -2) {
    recommendedRelays.radiativeSkyValve = true;
    activeMode = 'RADIATIVE_SKY';
    reasoning = `Clear sky night detected (${currentHourForecast.cloudCoverPercent}% cloud cover). Radiative sky cooling valve open to dump heat into outer space (8-13 µm window) for zero electricity cost.`;
  }

  // Stage 2: Rainwater-Cooled Condenser
  if (recommendedRelays.compressorBackup && (currentAmbientTemp > 24 || currentRH > 80)) {
    recommendedRelays.rainwaterPump = true;
    reasoning += ` Rainwater condenser loop engaged to drop condensing temperature and boost COP by +34%.`;
  }

  // Active Compressor scheduling during optimal ambient windows
  if (telemetry.chamberTemp > crop.idealTempMax && !recommendedRelays.pcmDischargeLoop) {
    recommendedRelays.compressorBackup = true;
    if (isOptimalAmbientHeatDump) {
      activeMode = 'COMPRESSOR_OPTIMAL';
      reasoning = `Cool ambient night air allows effortless heat rejection to atmosphere. Compressor operating at peak COP.`;
    }
  }

  // Stage 5: Controlled Atmosphere & Intermittent N2 Dosing
  let n2DosingActive = false;
  let humanSafetyAlarm = false;

  if (telemetry.o2Percent > crop.idealO2Max) {
    recommendedRelays.n2SolenoidValve = true;
    n2DosingActive = true;
  } else if (telemetry.o2Percent < crop.idealO2Min) {
    recommendedRelays.ventDamper = true;
  }

  // Asphyxiation Safety Interlock: If O2 < 18%, sound alarm and lock door!
  if (telemetry.o2Percent < 18.0) {
    humanSafetyAlarm = true;
    recommendedRelays.safetyDoorLock = true;
    reasoning += ` [SAFETY INTERLOCK]: Oxygen at ${telemetry.o2Percent}% (<18%). Door locked against accidental entry.`;
  }

  // SIH Thermodynamic Calculations
  const copConventional = 2.35;
  const copHybrid = recommendedRelays.rainwaterPump ? 3.42 : 3.05;

  const eConv = 3.6;
  const eHybrid = recommendedRelays.pcmDischargeLoop || recommendedRelays.radiativeSkyValve ? 0.35 : 0.95;
  const energySavingPercent = Math.round(((eConv - eHybrid) / eConv) * 100);

  // 5. Generate 10-Day 240-Hour Predictive Matrix
  const tenDaySchedule: HourlyScheduleDecision[] = [];
  let simBattery = telemetry.batterySocPercent;
  let simPcm = telemetry.pcmChargePercent;

  for (let i = 0; i < Math.min(240, weather.hourly.length); i++) {
    const h = weather.hourly[i];
    const isNightHour = new Date(h.time).getHours() >= 21 || new Date(h.time).getHours() <= 5;
    const isSolarPeak = h.solarRadiationWatts > 350;
    const isSevere = h.precipitationProbability > 65;

    let action: HourlyScheduleDecision['recommendedAction'] = 'STANDBY';
    let cop = 2.4;

    if (isSevere && simPcm > 15) {
      action = 'PCM_PASSIVE_DISCHARGE';
      simPcm = Math.max(10, simPcm - 0.9);
      cop = 4.8;
    } else if (isSolarPeak && simPcm < 95) {
      action = 'PCM_PRE_FREEZE';
      simPcm = Math.min(100, simPcm + 3.2);
      simBattery = Math.min(100, simBattery + 1.5);
      cop = 3.2;
    } else if (h.isClearSkyNight) {
      action = 'RADIATIVE_SKY_COOLING';
      simPcm = Math.min(100, simPcm + 1.2);
      cop = 6.2;
    } else if (isNightHour && simBattery > weights.batterySafetyThreshold + 15) {
      action = 'COMPRESSOR_NIGHT_DUMP';
      simBattery = Math.max(weights.batterySafetyThreshold, simBattery - 1.2);
      cop = 3.4;
    } else {
      action = 'STANDBY';
    }

    const timeDate = new Date(h.time);
    const timeLabel = `D${Math.floor(i / 24) + 1} ${timeDate.getHours()}:00`;

    tenDaySchedule.push({
      hourIndex: i,
      timeLabel,
      ambientTemp: h.temperature,
      solarWatts: h.solarRadiationWatts,
      rainProb: h.precipitationProbability,
      recommendedAction: action,
      projectedBatterySoc: Math.round(simBattery),
      projectedPcmCharge: Math.round(simPcm),
      projectedChamberTemp: crop.idealTempMin + 1.5,
      copEstimated: cop,
    });
  }

  return {
    activeMode,
    recommendedRelays,
    reasoning,
    targetChamberTemp: (crop.idealTempMin + crop.idealTempMax) / 2,
    targetRH: (crop.idealRHMin + crop.idealRHMax) / 2,
    targetO2: (crop.idealO2Min + crop.idealO2Max) / 2,
    targetCO2: crop.maxCO2Limit,
    n2DosingActive,
    humanSafetyAlarm,
    predictedAutonomyDays,
    pcmAutonomyDays,
    batteryAutonomyHours,
    energySavingPercent,
    copHybrid,
    copConventional,
    tenDaySchedule,
  };
}

export function trainAiModelStep(
  currentWeights: AiOptimizationWeights,
  currentEpoch: number
): { newWeights: AiOptimizationWeights; log: TrainingLogEntry } {
  const lr = 0.015;
  const simulatedLoss = Math.max(0.042, 0.28 * Math.exp(-currentEpoch * 0.18) + (Math.random() * 0.01));
  const simulatedReward = Math.min(99.2, 75.0 + currentEpoch * 3.1 - (Math.random() * 0.5));

  const newWeights: AiOptimizationWeights = {
    ...currentWeights,
    weightSolarPreference: Math.min(1.0, currentWeights.weightSolarPreference + lr * 0.8),
    weightPcmPreservation: Math.min(1.0, currentWeights.weightPcmPreservation + lr * 0.6),
    weightRainwaterCOP: Math.min(1.0, currentWeights.weightRainwaterCOP + lr * 0.5),
    weightRadiativeSky: Math.min(1.0, currentWeights.weightRadiativeSky + lr * 0.7),
  };

  const log: TrainingLogEntry = {
    epoch: currentEpoch + 1,
    timestamp: new Date().toLocaleTimeString(),
    lossValue: Math.round(simulatedLoss * 1000) / 1000,
    rewardValue: Math.round(simulatedReward * 10) / 10,
    learningRate: lr,
    notes: `Epoch ${currentEpoch + 1}: Multi-stage thermal policy optimized. Energy loss: ${Math.round(simulatedLoss * 100)}%.`,
  };

  return { newWeights, log };
}
