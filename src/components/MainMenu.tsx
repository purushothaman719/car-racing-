import React, { useState } from 'react';
import { Vehicle, GameMode } from '../types';
import { 
  Play, 
  Wrench, 
  Award, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Flame,
  ChevronRight
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  vehicle: Vehicle;
  highScore: number;
  totalCookies: number;
  unclaimedMissionsCount: number;
  onStartGame: (mode: GameMode) => void;
  onOpenGarage: () => void;
  onOpenMissions: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
}

export const MainMenu: React.FC<Props> = ({
  vehicle,
  highScore,
  totalCookies,
  unclaimedMissionsCount,
  onStartGame,
  onOpenGarage,
  onOpenMissions,
  audioMuted,
  onToggleAudio,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-amber-950 via-zinc-950 to-black text-slate-100 overflow-y-auto">
      
      {/* Top Bar (High Score, Cookies Bank, Audio & Help) */}
      <div className="flex items-center justify-between gap-3 z-10">
        {/* High Score Badge */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/40 shadow-lg">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div className="text-left">
            <span className="text-[10px] text-amber-300 font-semibold uppercase block">Best Record</span>
            <span className="font-fun font-bold text-base sm:text-lg text-yellow-300 leading-none">
              {highScore.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Cookies Bank & Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/40 shadow-lg">
            <span className="text-xl">🍪</span>
            <div className="text-right">
              <span className="text-[10px] text-amber-300 font-semibold uppercase block">Bank</span>
              <span className="font-fun font-bold text-base sm:text-lg text-white leading-none">
                {totalCookies.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleAudio();
            }}
            className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
            title="Toggle Sound"
          >
            {audioMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowHowToPlay(true);
            }}
            className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-amber-300 hover:text-white transition-all cursor-pointer shadow-md"
            title="How to Play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="my-auto flex flex-col items-center text-center py-6 z-10 max-w-xl mx-auto w-full">
        {/* Floating Animated Title Logo */}
        <div className="relative mb-6">
          <div className="text-6xl sm:text-7xl animate-cookie-float mb-2 drop-shadow-[0_10px_20px_rgba(245,158,11,0.4)]">
            🏎️🍪
          </div>
          <h1 className="text-5xl sm:text-6xl font-fun font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-md">
            COOKIE DRIVE
          </h1>
          <p className="text-sm sm:text-base text-amber-200/80 font-medium mt-1">
            Steer through sweet traffic & collect delicious cookies!
          </p>
        </div>

        {/* Selected Vehicle Showcase Card */}
        <div className="w-full bg-gradient-to-r from-amber-950/80 to-zinc-900/80 backdrop-blur-md p-4 rounded-3xl border border-amber-500/30 shadow-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-md text-2xl"
              style={{ backgroundColor: vehicle.color }}
            >
              🚗
            </div>
            <div className="text-left">
              <div className="font-fun font-bold text-lg text-white flex items-center gap-2">
                {vehicle.name}
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
                  {vehicle.topSpeed} km/h
                </span>
              </div>
              <p className="text-xs text-zinc-400">{vehicle.tagline}</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenGarage();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-fun font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>

        {/* Big Start Driving Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            soundManager.unlockAudio();
            onStartGame('ENDLESS');
          }}
          className="w-full max-w-sm py-4 px-8 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-fun font-black text-2xl sm:text-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer animate-pulse-glow"
        >
          <Play className="w-8 h-8 fill-slate-950" />
          <span>START DRIVE</span>
        </button>
      </div>

      {/* Bottom Shortcuts (Garage & Missions) */}
      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full z-10">
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenGarage();
          }}
          className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 backdrop-blur-md border border-white/10 hover:border-amber-500/40 flex items-center justify-between transition-all cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-fun font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                Sweet Garage
              </div>
              <div className="text-[11px] text-zinc-400">Cars & Upgrades</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400" />
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenMissions();
          }}
          className="relative p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 backdrop-blur-md border border-white/10 hover:border-amber-500/40 flex items-center justify-between transition-all cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-fun font-bold text-sm text-white group-hover:text-yellow-300 transition-colors">
                Missions
              </div>
              <div className="text-[11px] text-zinc-400">Challenges & Rewards</div>
            </div>
          </div>

          {unclaimedMissionsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center animate-bounce">
              {unclaimedMissionsCount}
            </span>
          )}
        </button>
      </div>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-amber-950 to-zinc-950 border border-amber-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-xl font-fun font-bold text-amber-200">How to Play Cookie Drive</h3>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowHowToPlay(false);
                }}
                className="text-zinc-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-xl">⌨️</span>
                <div>
                  <span className="font-fun font-bold text-white block">Steering Controls</span>
                  <span>Use <b>Left / Right Arrows</b> or <b>A / D</b> (or touch buttons)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <span className="font-fun font-bold text-white block">Nitro Boost & Brakes</span>
                  <span>Hold <b>Space / Up Arrow</b> for Nitro speed, <b>Down</b> for Brakes</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-xl">🍪</span>
                <div>
                  <span className="font-fun font-bold text-white block">Cookies & Combos</span>
                  <span>Collect cookies in sequence without crashing to fill the <b>Fever Frenzy</b> meter!</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <div>
                  <span className="font-fun font-bold text-white block">Avoid Obstacles & Smashes</span>
                  <span>Dodge traffic and oil slicks. Shields and Fever Mode allow smashing through traffic for +250 pts!</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowHowToPlay(false);
              }}
              className="w-full mt-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-fun font-bold cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
