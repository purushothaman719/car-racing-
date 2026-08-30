import React, { useEffect } from 'react';
import { GameStats } from '../types';
import { RotateCcw, Wrench, Home, Trophy, Sparkles, Flame, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface Props {
  stats: GameStats;
  isNewHighScore: boolean;
  onRestart: () => void;
  onOpenGarage: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  stats,
  isNewHighScore,
  onRestart,
  onOpenGarage,
  onReturnHome,
}) => {
  useEffect(() => {
    if (isNewHighScore) {
      soundManager.playFeverFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#38bdf8', '#fbbf24', '#ffffff'],
      });
    }
  }, [isNewHighScore]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-950/90 to-zinc-950 border-2 border-amber-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center text-slate-100 overflow-hidden">
        
        {/* Top Header Badge */}
        {isNewHighScore ? (
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-fun font-bold px-4 py-1 rounded-full text-sm shadow-lg animate-bounce mb-3">
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>NEW HIGH SCORE!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-rose-400 font-fun font-bold text-sm uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>CRASHED OUT</span>
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-fun font-extrabold text-amber-200 mb-1">
          {isNewHighScore ? 'Legendary Drive!' : 'Sweet Run Over'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 mb-6">
          Your car took a delicious tumble. Here is your bakery run summary!
        </p>

        {/* Primary Score & Cookies Cards */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-black/50 p-4 rounded-2xl border border-amber-500/30 flex flex-col items-center">
            <span className="text-xs text-amber-400 font-semibold uppercase">Total Score</span>
            <span className="text-2xl sm:text-3xl font-fun font-bold text-yellow-300">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/50 p-4 rounded-2xl border border-amber-500/30 flex flex-col items-center">
            <span className="text-xs text-amber-400 font-semibold uppercase">Cookies Gathered</span>
            <span className="text-2xl sm:text-3xl font-fun font-bold text-amber-100 flex items-center gap-1">
              <span>🍪</span> {stats.cookiesCollectedThisRun}
            </span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full bg-zinc-900/60 p-3.5 rounded-2xl border border-white/10 mb-6 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-zinc-400">Distance</span>
            <span className="font-fun font-bold text-sm text-white">{stats.distanceMeters} m</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-400">Max Combo</span>
            <span className="font-fun font-bold text-sm text-pink-400">{stats.maxCombo}x</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-400">Near Misses</span>
            <span className="font-fun font-bold text-sm text-sky-400">{stats.nearMissCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-fun font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Drive Again</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenGarage();
            }}
            className="py-3.5 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-200 border border-amber-500/30 font-fun font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Garage</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnHome();
            }}
            className="p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Main Menu"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
