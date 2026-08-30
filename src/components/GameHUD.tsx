import React from 'react';
import { GameStats, Vehicle } from '../types';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Shield, 
  Gauge, 
  Sparkles,
  Trophy
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  stats: GameStats;
  vehicle: Vehicle;
  isPaused: boolean;
  onTogglePause: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onOpenGarage: () => void;
  onOpenMissions: () => void;
}

export const GameHUD: React.FC<Props> = ({
  stats,
  isPaused,
  onTogglePause,
  audioMuted,
  onToggleAudio,
  onOpenGarage,
  onOpenMissions,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4 z-20">
      {/* Top Header Stats Bar */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {/* Left: Score & Cookies */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-500/30 shadow-lg">
            <span className="text-xl sm:text-2xl animate-bounce">🍪</span>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-semibold text-amber-300 uppercase tracking-wider">Cookies</span>
              <span className="text-lg sm:text-2xl font-bold font-fun text-white leading-tight">
                {stats.cookiesCollectedThisRun}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs sm:text-sm">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-zinc-400">Score:</span>
            <span className="font-bold font-fun text-yellow-300 text-sm sm:text-base">{stats.score.toLocaleString()}</span>
          </div>
        </div>

        {/* Center: Fever Meter & Combo Badge */}
        <div className="flex flex-col items-center max-w-[180px] sm:max-w-[240px] w-full">
          {/* Combo Multiplier */}
          {stats.currentCombo > 1 && (
            <div className="animate-pulse flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-fun font-bold px-3 py-0.5 rounded-full text-xs sm:text-sm shadow-md mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{stats.currentCombo}x COMBO!</span>
            </div>
          )}

          {/* Fever Bar */}
          <div className="w-full bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-pink-500/30 flex items-center gap-1.5 shadow-md">
            <Flame className={`w-4 h-4 ${stats.isFeverActive ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <div className="relative w-full h-3 bg-zinc-900/90 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 rounded-full ${
                  stats.isFeverActive 
                    ? 'bg-gradient-to-r from-rose-500 via-yellow-400 to-pink-500 animate-pulse' 
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${stats.feverGauge}%` }}
              />
            </div>
            <span className="text-[10px] font-fun font-bold text-amber-200 uppercase px-1">
              {stats.isFeverActive ? 'FEVER!' : 'RUSH'}
            </span>
          </div>
        </div>

        {/* Right: Controls & Speedometer */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Speed Indicator */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-sky-500/30 shadow-lg text-right">
            <Gauge className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[9px] sm:text-[10px] text-sky-300 font-semibold uppercase">Speed</div>
              <div className="text-sm sm:text-lg font-bold font-fun text-white leading-tight">
                {stats.speedKmh} <span className="text-[10px] text-zinc-400 font-normal">km/h</span>
              </div>
            </div>
          </div>

          {/* Audio toggle button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleAudio();
            }}
            className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md rounded-xl border border-white/15 text-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onTogglePause();
            }}
            className="p-2.5 bg-amber-600/80 hover:bg-amber-500 backdrop-blur-md rounded-xl border border-amber-400/40 text-white transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            title="Pause Game"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Health & Distance Bar */}
      <div className="flex items-end justify-between pointer-events-auto">
        {/* Lives / Hull Durability */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 shadow-lg">
          <Shield className="w-4 h-4 text-rose-400 mr-1" />
          <div className="flex gap-1">
            {Array.from({ length: stats.maxHealth }).map((_, i) => (
              <span
                key={i}
                className={`text-lg sm:text-xl transition-all duration-300 ${
                  i < stats.health 
                    ? 'opacity-100 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                    : 'opacity-25 grayscale scale-90'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Distance Traveled */}
        <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 shadow-lg text-center">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Distance</span>
          <div className="text-base sm:text-lg font-fun font-bold text-amber-300">
            {stats.distanceMeters.toLocaleString()} <span className="text-xs font-normal text-zinc-300">m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
