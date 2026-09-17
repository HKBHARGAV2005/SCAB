import { TelemetryData, CropId } from '../types/telemetry';

export function decodeSmsTelemetry(smsBody: string): Partial<TelemetryData> | null {
  try {
    const clean = smsBody.trim();
    if (!clean.startsWith('$SCAB') || !clean.endsWith('#')) {
      return null;
    }

    const content = clean.slice(5, -1); // strip '$SCAB,' and '#'
    const parts = content.split(',');
    const map: Record<string, string> = {};

    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k && v) {
        map[k.trim()] = v.trim();
      }
    }

    const partial: Partial<TelemetryData> = {};

    if (map['LAT'] && map['LON']) {
      partial.gps = {
        latitude: parseFloat(map['LAT']),
        longitude: parseFloat(map['LON']),
        altitudeMeters: parseFloat(map['ALT'] || '1520'),
        locationName: map['LOC'] || 'Shillong (Rural Cluster)',
        state: map['ST'] || 'Meghalaya',
        satellites: parseInt(map['SAT'] || '8', 10),
        hasFix: true,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    }

    if (map['TC']) partial.chamberTemp = parseFloat(map['TC']);
    if (map['RH']) partial.chamberRH = parseFloat(map['RH']);
    if (map['O2']) partial.o2Percent = parseFloat(map['O2']);
    if (map['CO2']) partial.co2Percent = parseFloat(map['CO2']);
    if (map['SOL']) partial.solarPowerWatts = parseFloat(map['SOL']);
    if (map['BAT']) partial.batterySocPercent = parseFloat(map['BAT']);
    if (map['PCM']) partial.pcmChargePercent = parseFloat(map['PCM']);
    if (map['KG']) partial.produceLoadKg = parseFloat(map['KG']);
    if (map['CROP']) partial.selectedCrop = map['CROP'] as CropId;

    return partial;
  } catch (err) {
    console.error('Failed to parse SMS telemetry string:', err);
    return null;
  }
}

export function encodeSmsCommand(params: {
  mode: string;
  targetTemp: number;
  rainwaterPump: boolean;
  pcmFreeze: boolean;
  n2Pulse: boolean;
  selectedCrop: string;
  loadKg: number;
}): string {
  const rain = params.rainwaterPump ? '1' : '0';
  const pcm = params.pcmFreeze ? '1' : '0';
  const n2 = params.n2Pulse ? '1' : '0';

  return `CMD,MODE=${params.mode},T_SET=${params.targetTemp.toFixed(1)},RAIN=${rain},PCM=${pcm},N2=${n2},CROP=${params.selectedCrop},KG=${params.loadKg}#`;
}

export function openSmsApp(phoneNumber: string, messageBody: string) {
  const encoded = encodeURIComponent(messageBody);
  window.location.href = `sms:${phoneNumber}?body=${encoded}`;
}
