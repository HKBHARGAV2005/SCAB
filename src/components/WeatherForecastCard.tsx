import React from 'react';
import { CloudRain, Sun, Cloud, Moon, AlertCircle, Calendar } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface WeatherForecastCardProps {
  weather: WeatherData;
}

export const WeatherForecastCard: React.FC<WeatherForecastCardProps> = ({ weather }) => {
  const upcomingMonsoon = weather.daily.filter((d) => d.isSevereMonsoonDay);

  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>10-Day Real-Time Meteorological Intelligence</span>
          </h3>
          <p className="text-xs text-slate-400">
            Powered by Open-Meteo live API for exact GPS coordinates in North Eastern Region.
          </p>
        </div>

        {upcomingMonsoon.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{upcomingMonsoon.length} Severe Monsoon Days Detected Ahead</span>
          </div>
        )}
      </div>

      {/* 10-Day Cards Horizontal Scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {weather.daily.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={day.date}
              className={`p-2.5 rounded-xl border flex flex-col justify-between text-center transition-all ${
                day.isSevereMonsoonDay
                  ? 'bg-blue-950/40 border-blue-500/40 shadow-sm shadow-blue-500/10'
                  : isToday
                  ? 'bg-teal-950/40 border-teal-500/40'
                  : 'bg-slate-900/60 border-slate-700/50'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {isToday ? 'Today' : day.dayOfWeek}
                </span>
                <div className="my-1.5 flex justify-center">
                  {day.weatherCondition === 'Heavy Storm' ? (
                    <CloudRain className="w-5 h-5 text-blue-400 animate-bounce" />
                  ) : day.weatherCondition === 'Rain / Monsoon' ? (
                    <CloudRain className="w-5 h-5 text-blue-400" />
                  ) : day.weatherCondition === 'Sunny' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : day.weatherCondition === 'Clear Sky Night' ? (
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Cloud className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="text-xs font-bold text-white">
                  {Math.round(day.tempMax)}° <span className="text-slate-500 text-[10px] font-normal">{Math.round(day.tempMin)}°</span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-700/40 text-[10px] space-y-0.5 font-mono">
                <div className="text-blue-400 font-semibold">{day.rainProbabilityMax}% Rain</div>
                <div className="text-amber-400">{day.estimatedSolarGenerationKwh} kWh</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
