export interface AiOptimizationWeights {
  weightSolarPreference: number; // w1: Maximize direct PV utilization
  weightPcmPreservation: number; // w2: Protect PCM reserve for harsh days
  weightRainwaterCOP: number; // w3: Benefit from rainwater condenser cooling
  weightRadiativeSky: number; // w4: Leverage clear night sky passive radiation
  weightCompressorAvoidance: number; // w5: Penalize grid/battery compressor run during hot hours
  batterySafetyThreshold: number; // % (e.g. 25% minimum buffer)
  preFreezingHorizonHours: number; // How many hours ahead to start pre-freezing (24-48h)
}

export interface HourlyScheduleDecision {
  hourIndex: number;
  timeLabel: string;
  ambientTemp: number;
  solarWatts: number;
  rainProb: number;
  recommendedAction:
    | 'EARTH_HX_PRECOOL'
    | 'RAINWATER_CONDENSER'
    | 'PCM_PRE_FREEZE'
    | 'PCM_PASSIVE_DISCHARGE'
    | 'RADIATIVE_SKY_COOLING'
    | 'N2_PULSE_ATMOSPHERE'
    | 'COMPRESSOR_NIGHT_DUMP'
    | 'STANDBY';
  projectedBatterySoc: number; // %
  projectedPcmCharge: number; // %
  projectedChamberTemp: number; // °C
  copEstimated: number;
}

export interface AiDecisionResult {
  activeMode: string;
  recommendedRelays: {
    earthAirFan: boolean;
    rainwaterPump: boolean;
    pcmFreezeLoop: boolean;
    pcmDischargeLoop: boolean;
    radiativeSkyValve: boolean;
    n2SolenoidValve: boolean;
    ventDamper: boolean;
    compressorBackup: boolean;
    safetyDoorLock: boolean;
  };
  reasoning: string;
  targetChamberTemp: number;
  targetRH: number;
  targetO2: number;
  targetCO2: number;
  n2DosingActive: boolean;
  humanSafetyAlarm: boolean; // True if O2 < 18%
  predictedAutonomyDays: number; // Sized for 7-8 days autonomy
  pcmAutonomyDays: number; // Sized for 4-5 days standalone
  batteryAutonomyHours: number; // Sized for 48 hours standalone
  energySavingPercent: number; // SIH Metric: ((E_conv - E_hybrid)/E_conv)*100
  copHybrid: number;
  copConventional: number;
  tenDaySchedule: HourlyScheduleDecision[];
}

export interface TrainingLogEntry {
  epoch: number;
  timestamp: string;
  lossValue: number;
  rewardValue: number;
  learningRate: number;
  notes: string;
}

export interface DeveloperAiState {
  weights: AiOptimizationWeights;
  trainingEpoch: number;
  isTraining: boolean;
  trainingHistory: TrainingLogEntry[];
  totalSimulationsRun: number;
}
