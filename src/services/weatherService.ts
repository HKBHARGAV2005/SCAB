import { WeatherData, DailyForecast, HourlyForecast } from '../types/weather';

export async function fetchTenDayForecast(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,rain,cloud_cover,direct_normal_irradiance,shortwave_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=10`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
    const data = await res.json();

    const hourly: HourlyForecast[] = [];
    const hourlyTimes: string[] = data.hourly?.time || [];
    const hourlyTemps: number[] = data.hourly?.temperature_2m || [];
    const hourlyRH: number[] = data.hourly?.relative_humidity_2m || [];
    const hourlyRainProb: number[] = data.hourly?.precipitation_probability || [];
    const hourlyRainMm: number[] = data.hourly?.rain || [];
    const hourlyClouds: number[] = data.hourly?.cloud_cover || [];
    const hourlySolar: number[] = data.hourly?.shortwave_radiation || [];

    for (let i = 0; i < hourlyTimes.length; i++) {
      const timeStr = hourlyTimes[i];
      const hour = new Date(timeStr).getHours();
      const isNight = hour >= 22 || hour <= 5;
      const clouds = hourlyClouds[i] ?? 40;
      const temp = hourlyTemps[i] ?? 22;
      const rh = hourlyRH[i] ?? 75;

      const isClearSkyNight = isNight && clouds < 30 && rh < 85;
      const optimalForCompressorHeatDump = isNight || temp < 22;

      hourly.push({
        time: timeStr,
        temperature: temp,
        relativeHumidity: rh,
        precipitationProbability: hourlyRainProb[i] ?? 20,
        rainMm: hourlyRainMm[i] ?? 0,
        cloudCoverPercent: clouds,
        solarRadiationWatts: hourlySolar[i] ?? 0,
        isClearSkyNight,
        optimalForCompressorHeatDump,
      });
    }

    const daily: DailyForecast[] = [];
    const dailyDates: string[] = data.daily?.time || [];
    const dailyMaxTemps: number[] = data.daily?.temperature_2m_max || [];
    const dailyMinTemps: number[] = data.daily?.temperature_2m_min || [];
    const dailyRainProbMax: number[] = data.daily?.precipitation_probability_max || [];
    const dailyRainSum: number[] = data.daily?.precipitation_sum || [];

    for (let d = 0; d < dailyDates.length; d++) {
      const dateStr = dailyDates[d];
      const dateObj = new Date(dateStr);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const rainProb = dailyRainProbMax[d] ?? 30;
      const rainSum = dailyRainSum[d] ?? 2;
      const isSevereMonsoon = rainProb >= 70 || rainSum >= 20;

      let condition: DailyForecast['weatherCondition'] = 'Sunny';
      if (rainProb >= 70) {
        condition = 'Heavy Storm';
      } else if (rainProb >= 40) {
        condition = 'Rain / Monsoon';
      } else if ((dailyMaxTemps[d] ?? 25) < 18) {
        condition = 'Clear Sky Night';
      } else if (rainProb > 25) {
        condition = 'Partly Cloudy';
      } else {
        condition = 'Sunny';
      }

      const estSolarHours = isSevereMonsoon ? 1.5 : rainProb > 40 ? 3.5 : 5.8;
      const solarKwh = Math.round(1.2 * estSolarHours * 0.82 * 10) / 10;

      let coolingStrategy = 'Solar PV + Rainwater HX';
      if (isSevereMonsoon) {
        coolingStrategy = 'Pre-frozen PCM Discharge + Earth-Air HX';
      } else if (condition === 'Sunny') {
        coolingStrategy = 'Solar Direct + PCM Pre-Freeze Buffer';
      }

      daily.push({
        date: dateStr,
        dayOfWeek,
        tempMax: dailyMaxTemps[d] ?? 26,
        tempMin: dailyMinTemps[d] ?? 17,
        avgHumidity: 82,
        rainProbabilityMax: rainProb,
        totalPrecipitationMm: rainSum,
        avgCloudCover: rainProb > 50 ? 80 : 35,
        solarHoursEstimate: estSolarHours,
        estimatedSolarGenerationKwh: solarKwh,
        weatherCondition: condition,
        isSevereMonsoonDay: isSevereMonsoon,
        predictedCoolingStrategy: coolingStrategy,
      });
    }

    return {
      latitude,
      longitude,
      timezone: data.timezone || 'Asia/Kolkata',
      elevation: data.elevation || 1496,
      currentTemp: hourly[0]?.temperature ?? 22,
      currentRH: hourly[0]?.relativeHumidity ?? 82,
      currentRainProb: hourly[0]?.precipitationProbability ?? 25,
      currentSolarWatts: hourly[0]?.solarRadiationWatts ?? 340,
      daily,
      hourly,
      lastFetched: new Date().toISOString(),
      isRealTime: true,
    };
  } catch (err) {
    console.warn('Falling back to synthetic North East Region 10-day meteorological model:', err);
    return getSyntheticNERWeather(latitude, longitude);
  }
}

export function getSyntheticNERWeather(latitude: number, longitude: number): WeatherData {
  const days: DailyForecast[] = [];
  const hourly: HourlyForecast[] = [];
  const now = new Date();

  const mockConditions: Array<{
    rainProb: number;
    rainMm: number;
    maxT: number;
    minT: number;
    cond: DailyForecast['weatherCondition'];
  }> = [
    { rainProb: 25, rainMm: 2, maxT: 27, minT: 18, cond: 'Sunny' },
    { rainProb: 35, rainMm: 5, maxT: 26, minT: 17, cond: 'Partly Cloudy' },
    { rainProb: 80, rainMm: 35, maxT: 23, minT: 16, cond: 'Heavy Storm' },
    { rainProb: 85, rainMm: 45, maxT: 22, minT: 15, cond: 'Heavy Storm' },
    { rainProb: 90, rainMm: 50, maxT: 21, minT: 15, cond: 'Heavy Storm' },
    { rainProb: 75, rainMm: 28, maxT: 23, minT: 16, cond: 'Rain / Monsoon' },
    { rainProb: 65, rainMm: 18, maxT: 24, minT: 17, cond: 'Rain / Monsoon' },
    { rainProb: 40, rainMm: 8, maxT: 25, minT: 17, cond: 'Partly Cloudy' },
    { rainProb: 20, rainMm: 0, maxT: 26, minT: 16, cond: 'Clear Sky Night' },
    { rainProb: 15, rainMm: 0, maxT: 27, minT: 17, cond: 'Sunny' },
  ];

  for (let i = 0; i < 10; i++) {
    const targetDate = new Date(now.getTime() + i * 86400000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const p = mockConditions[i];
    const isSevere = p.rainProb >= 70;
    const estSun = isSevere ? 1.2 : p.rainProb > 40 ? 3.0 : 6.0;

    days.push({
      date: dateStr,
      dayOfWeek,
      tempMax: p.maxT,
      tempMin: p.minT,
      avgHumidity: isSevere ? 94 : 78,
      rainProbabilityMax: p.rainProb,
      totalPrecipitationMm: p.rainMm,
      avgCloudCover: isSevere ? 92 : 35,
      solarHoursEstimate: estSun,
      estimatedSolarGenerationKwh: Math.round(1.2 * estSun * 0.82 * 10) / 10,
      weatherCondition: p.cond,
      isSevereMonsoonDay: isSevere,
      predictedCoolingStrategy: isSevere
        ? 'Pre-frozen PCM Discharge + Earth-Air HX'
        : 'Solar PV + Rainwater HX Boost',
    });

    for (let h = 0; h < 24; h++) {
      const hourDate = new Date(targetDate.getTime() + h * 3600000);
      const isNight = h >= 22 || h <= 5;
      const isPeakSun = h >= 10 && h <= 15;
      const temp = isNight ? p.minT : p.maxT - (Math.abs(13 - h) * 1.2);
      const solar = isPeakSun && !isSevere ? 650 - Math.abs(13 - h) * 90 : isSevere ? 80 : 0;

      hourly.push({
        time: hourDate.toISOString(),
        temperature: Math.round(temp * 10) / 10,
        relativeHumidity: isNight ? 92 : 75,
        precipitationProbability: p.rainProb,
        rainMm: isSevere ? 2.5 : 0,
        cloudCoverPercent: isSevere ? 90 : 30,
        solarRadiationWatts: Math.max(0, Math.round(solar)),
        isClearSkyNight: isNight && !isSevere,
        optimalForCompressorHeatDump: isNight || temp < 22,
      });
    }
  }

  return {
    latitude,
    longitude,
    timezone: 'Asia/Kolkata',
    elevation: 1525,
    currentTemp: 23.4,
    currentRH: 86,
    currentRainProb: 30,
    currentSolarWatts: 420,
    daily: days,
    hourly,
    lastFetched: new Date().toISOString(),
    isRealTime: false,
  };
}
