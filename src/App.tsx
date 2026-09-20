import React, { useState, useEffect, useMemo } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { FarmerDashboard } from './components/FarmerDashboard';
import { DeveloperPortal } from './components/DeveloperPortal';
import { WeatherForecastCard } from './components/WeatherForecastCard';
import { ThermalDiagram } from './components/ThermalDiagram';
import { ControlledAtmoCard } from './components/ControlledAtmoCard';
import { GpsMapTracker } from './components/GpsMapTracker';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { TelemetryData, CropId, RelayStates } from './types/telemetry';
import { WeatherData } from './types/weather';
import { DeveloperAiState, AiOptimizationWeights } from './types/aiEngine';
import {
  evaluateColdPriming,
  runAiOptimization,
  DEFAULT_AI_WEIGHTS,
} from './services/aiDecisionEngine';
import { fetchTenDayForecast, getSyntheticNERWeather, reverseGeocodeCoordinates } from './services/weatherService';
import { decodeSmsTelemetry } from './services/smsProtocol';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'farmer' | 'developer'>('farmer');

  // Initial North Eastern Deployment Location: Shillong Rural Agricultural Cluster
  const initialGps = {
    latitude: 25.5788,
    longitude: 91.8933,
    altitudeMeters: 1525,
    locationName: 'Shillong (Rural Cluster)',
    state: 'Meghalaya',
    satellites: 9,
    hasFix: true,
    lastUpdated: '12:30 PM',
  };

  // Initial Hardware Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    timestamp: new Date().toISOString(),
    gps: initialGps,
    chamberTemp: 7.4,
    chamberRH: 92,
    o2Percent: 4.2,
    co2Percent: 3.1,
    n2Percent: 92.7,
    pcmTemp: -1.5,
    pcmChargePercent: 98,
    pcmVolumeLiters: 120,
    batterySocPercent: 98,
    batteryVoltage: 26.8,
    batteryCurrentAmps: 4.2,
    solarPowerWatts: 420,
    selectedCrop: 'green_chilli',
    produceLoadKg: 160,
    produceLoadedAt: new Date().toISOString(),
    primingStatus: evaluateColdPriming(98, -1.5, 98),
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
    coolingMode: 'RAINWATER_BOOST',
    gsmSignalDbm: -72,
  });

  // Weather State
  const [weather, setWeather] = useState<WeatherData>(() =>
    getSyntheticNERWeather(initialGps.latitude, initialGps.longitude)
  );

  // Attempt device real-time geolocation on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lon = Math.round(pos.coords.longitude * 10000) / 10000;
          const alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : 1525;
          let locName = 'Live Device Station';
          let locState = 'Field Coordinates';
          try {
            const geo = await reverseGeocodeCoordinates(lat, lon);
            locName = geo.name;
            locState = geo.state;
          } catch {
            // fallback
          }

          setTelemetry((prev) => ({
            ...prev,
            gps: {
              ...prev.gps,
              latitude: lat,
              longitude: lon,
              altitudeMeters: alt,
              locationName: locName,
              state: locState,
              lastUpdated: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            },
          }));
        },
        () => {
          // Fallback to initial NER cluster if location access is restricted
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
      );
    }
  }, []);

  // Fetch real 10-day weather on mount and when GPS coordinates change
  useEffect(() => {
    let active = true;
    fetchTenDayForecast(telemetry.gps.latitude, telemetry.gps.longitude).then((data) => {
      if (active) setWeather(data);
    });
    return () => {
      active = false;
    };
  }, [telemetry.gps.latitude, telemetry.gps.longitude]);

  // Developer AI State
  const [aiState, setAiState] = useState<DeveloperAiState>({
    weights: DEFAULT_AI_WEIGHTS,
    trainingEpoch: 14,
    isTraining: false,
    trainingHistory: [
      { epoch: 11, timestamp: '11:15 AM', lossValue: 0.082, rewardValue: 84.1, learningRate: 0.015, notes: 'Multi-stage thermal policy initialized' },
      { epoch: 12, timestamp: '11:35 AM', lossValue: 0.065, rewardValue: 87.5, learningRate: 0.015, notes: 'Monsoon pre-freezing lookahead tuned' },
      { epoch: 13, timestamp: '12:00 PM', lossValue: 0.051, rewardValue: 90.2, learningRate: 0.015, notes: 'Rainwater condenser COP subcooling weighted' },
      { epoch: 14, timestamp: '12:30 PM', lossValue: 0.044, rewardValue: 92.4, learningRate: 0.015, notes: 'Night radiative window 8-13um optimized' },
    ],
    totalSimulationsRun: 32,
  });

  // Execute Background AI Optimization Engine
  const aiResult = useMemo(() => {
    return runAiOptimization(telemetry, weather, aiState.weights);
  }, [telemetry, weather, aiState.weights]);

  // Sync AI results with telemetry priming and relays
  useEffect(() => {
    setTelemetry((prev) => ({
      ...prev,
      primingStatus: evaluateColdPriming(
        prev.batterySocPercent,
        prev.pcmTemp,
        prev.pcmChargePercent
      ),
      relays: {
        ...prev.relays,
        ...aiResult.recommendedRelays,
      },
      coolingMode: aiResult.activeMode as any,
    }));
  }, [aiResult.activeMode, aiResult.recommendedRelays]);

  // Handlers
  const handleCropChange = (cropId: CropId) => {
    setTelemetry((prev) => ({
      ...prev,
      selectedCrop: cropId,
    }));
  };

  const handleQuantityChange = (kg: number) => {
    setTelemetry((prev) => ({
      ...prev,
      produceLoadKg: kg,
    }));
  };

  const handleToggleRelay = (relayKey: keyof RelayStates) => {
    setTelemetry((prev) => ({
      ...prev,
      relays: {
        ...prev.relays,
        [relayKey]: !prev.relays[relayKey],
      },
    }));
  };

  const handleUpdateWeights = (newWeights: AiOptimizationWeights) => {
    setAiState((prev) => ({
      ...prev,
      weights: newWeights,
    }));
  };

  const handleApplyScenario = (scenarioData: Partial<TelemetryData>) => {
    setTelemetry((prev) => ({
      ...prev,
      ...scenarioData,
      primingStatus: evaluateColdPriming(
        scenarioData.batterySocPercent ?? prev.batterySocPercent,
        scenarioData.pcmTemp ?? prev.pcmTemp,
        scenarioData.pcmChargePercent ?? prev.pcmChargePercent
      ),
    }));
  };

  const handleSelectPresetLocation = (loc: {
    lat: number;
    lon: number;
    name: string;
    state: string;
    alt: number;
  }) => {
    setTelemetry((prev) => ({
      ...prev,
      gps: {
        ...prev.gps,
        latitude: loc.lat,
        longitude: loc.lon,
        locationName: loc.name,
        state: loc.state,
        altitudeMeters: loc.alt,
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      },
    }));
  };

  const handleUpdateManualTelemetry = async (updates: Partial<TelemetryData>) => {
    let resolvedGps = updates.gps ? { ...updates.gps } : undefined;
    if (resolvedGps && resolvedGps.latitude && resolvedGps.longitude) {
      if (!resolvedGps.locationName || resolvedGps.locationName.includes('°')) {
        try {
          const geo = await reverseGeocodeCoordinates(resolvedGps.latitude, resolvedGps.longitude);
          resolvedGps.locationName = geo.name;
          resolvedGps.state = geo.state;
        } catch {
          // keep fallback
        }
      }
    }

    setTelemetry((prev) => {
      const nextGps = resolvedGps ? { ...prev.gps, ...resolvedGps } : prev.gps;
      const nextBat = updates.batterySocPercent ?? prev.batterySocPercent;
      const nextPcmTemp = updates.pcmTemp ?? prev.pcmTemp;
      const nextPcmCharge = updates.pcmChargePercent ?? prev.pcmChargePercent;
      return {
        ...prev,
        ...updates,
        gps: nextGps,
        primingStatus: evaluateColdPriming(nextBat, nextPcmTemp, nextPcmCharge),
      };
    });
  };

  const handleInjectSms = async (smsBody: string) => {
    const parsed = decodeSmsTelemetry(smsBody);
    if (parsed) {
      let resolvedGps = parsed.gps ? { ...parsed.gps } : undefined;
      if (resolvedGps && resolvedGps.latitude && resolvedGps.longitude) {
        try {
          const geo = await reverseGeocodeCoordinates(resolvedGps.latitude, resolvedGps.longitude);
          resolvedGps.locationName = geo.name;
          resolvedGps.state = geo.state;
        } catch {
          // fallback
        }
      }

      setTelemetry((prev) => {
        const nextGps = resolvedGps ? { ...prev.gps, ...resolvedGps } : prev.gps;
        const nextBat = parsed.batterySocPercent ?? prev.batterySocPercent;
        const nextPcmTemp = parsed.pcmTemp ?? prev.pcmTemp;
        const nextPcmCharge = parsed.pcmChargePercent ?? prev.pcmChargePercent;
        return {
          ...prev,
          ...parsed,
          gps: nextGps,
          primingStatus: evaluateColdPriming(nextBat, nextPcmTemp, nextPcmCharge),
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top App Header & Mode Switcher */}
      <HeaderNav
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        telemetry={telemetry}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Scenario Simulator: Always accessible for instant SIH jury demonstration */}
        <ScenarioSimulator onApplyScenario={handleApplyScenario} />

        {/* View Switcher: Farmer View vs Developer / AI View */}
        {currentMode === 'farmer' ? (
          <FarmerDashboard
            telemetry={telemetry}
            aiResult={aiResult}
            onCropChange={handleCropChange}
            onQuantityChange={handleQuantityChange}
            onSendSmsCommand={(cmd) => {
              console.log('Dispatched SMS command:', cmd);
            }}
          />
        ) : (
          <DeveloperPortal
            telemetry={telemetry}
            weather={weather}
            aiResult={aiResult}
            aiState={aiState}
            onUpdateWeights={handleUpdateWeights}
            onSetAiState={setAiState}
            onToggleRelay={handleToggleRelay}
            onInjectSms={handleInjectSms}
            onUpdateTelemetry={handleUpdateManualTelemetry}
          />
        )}

        {/* Coordinated System Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThermalDiagram telemetry={telemetry} aiResult={aiResult} />
          <ControlledAtmoCard telemetry={telemetry} aiResult={aiResult} />
        </div>

        {/* 10-Day Meteorological Forecast */}
        <WeatherForecastCard weather={weather} location={telemetry.gps} />

        {/* u-blox NEO GPS Tracking Map */}
        <GpsMapTracker
          gps={telemetry.gps}
          onSelectPresetLocation={handleSelectPresetLocation}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <span>Smart India Hackathon (SIH 2026) • SCAB: Solar Cold-storage Adaptive Brain • North Eastern Region (NER)</span>
      </footer>
    </div>
  );
};
