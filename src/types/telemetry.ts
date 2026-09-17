export type CropId =
  | 'bhut_jolokia'
  | 'green_chilli'
  | 'cabbage'
  | 'french_beans'
  | 'tomatoes'
  | 'leafy_mustard'
  | 'ginger'
  | 'turmeric';

export interface CropProfile {
  id: CropId;
  name: string;
  regionalName: string; // e.g., Assamese / local name
  category: 'Spices' | 'Vegetables' | 'Tubers';
  idealTempMin: number; // °C
  idealTempMax: number; // °C
  idealRHMin: number; // %
  idealRHMax: number; // %
  idealO2Min: number; // %
  idealO2Max: number; // %
  maxCO2Limit: number; // %
  respirationRate: 'Very High' | 'High' | 'Moderate' | 'Low';
  ethyleneSensitivity: 'High' | 'Medium' | 'Low';
  standardShelfLifeDays: number; // normal ambient storage
  scabShelfLifeDays: number; // extended storage under SCAB
  icon: string;
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  locationName: string;
  state: string;
  satellites: number;
  hasFix: boolean;
  lastUpdated: string;
}

export interface RelayStates {
  earthAirFan: boolean; // Stage 1: Earth-Air HX Pre-cooling
  rainwaterPump: boolean; // Stage 2: Rainwater Condenser Cooling HX
  pcmFreezeLoop: boolean; // Stage 3: PCM Charging (solar freezing)
  pcmDischargeLoop: boolean; // Stage 3: PCM Discharging (passive cooling)
  radiativeSkyValve: boolean; // Stage 4: Night Radiative Sky Loop
  n2SolenoidValve: boolean; // Stage 5: Intermittent N2 Injection
  ventDamper: boolean; // Safety purging / O2 regulation
  compressorBackup: boolean; // Active DC Variable-speed compressor
  auxPeltier: boolean; // Precision trimming / sensor cooling
  safetyDoorLock: boolean; // Locked if O2 < 18% for human safety
}

export interface ColdPrimingStatus {
  isPrimed: boolean; // True only when battery=100% and PCM=100% frozen
  batterySoc: number; // % (Target: 100%)
  pcmFreezePercent: number; // % (Target: 100%)
  pcmTemp: number; // °C (Target: <= 0°C)
  readyForLoading: boolean; // Blocks loading if false
  statusMessage: string;
}

export interface TelemetryData {
  timestamp: string;
  gps: GpsLocation;
  chamberTemp: number; // °C
  chamberRH: number; // %
  o2Percent: number; // %
  co2Percent: number; // %
  n2Percent: number; // %
  pcmTemp: number; // °C
  pcmChargePercent: number; // % (Ice frozen fraction)
  pcmVolumeLiters: number; // Liters of water/PCM
  batterySocPercent: number; // LiFePO4 SOC %
  batteryVoltage: number; // Volts
  batteryCurrentAmps: number; // Amps (+ charging, - discharging)
  solarPowerWatts: number; // Solar PV generation
  selectedCrop: CropId;
  produceLoadKg: number; // Weight of stored crop
  produceLoadedAt: string;
  primingStatus: ColdPrimingStatus;
  relays: RelayStates;
  coolingMode: 'PRE_COOLING' | 'RAINWATER_BOOST' | 'PCM_DISCHARGE' | 'RADIATIVE_SKY' | 'COMPRESSOR_OPTIMAL' | 'STANDBY';
  gsmSignalDbm: number; // SIM800L RSSI
}
