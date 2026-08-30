import React from 'react';
import { ArrowLeft, ArrowRight, Zap, ShieldAlert } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  onSteerChange: (dir: number) => void;
  onBoostChange: (boosting: boolean) => void;
  onBrakeChange: (braking: boolean) => void;
}

export const TouchControls: React.FC<Props> = ({
  onSteerChange,
  onBoostChange,
  onBrakeChange,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none z-20 flex justify-between items-end px-4 sm:px-6">
      {/* Left & Right Steering Buttons */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={() => {
            soundManager.unlockAudio();
            onSteerChange(-1);
          }}
          onPointerUp={() => onSteerChange(0)}
          onPointerLeave={() => onSteerChange(0)}
          className="w-16 h-16 sm:w-18 sm:h-18 bg-amber-950/70 active:bg-amber-600 backdrop-blur-md rounded-2xl border-2 border-amber-400/40 text-amber-200 flex items-center justify-center shadow-xl active:scale-95 transition-transform touch-none select-none"
          aria-label="Steer Left"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <button
          type="button"
          onPointerDown={() => {
            soundManager.unlockAudio();
            onSteerChange(1);
          }}
          onPointerUp={() => onSteerChange(0)}
          onPointerLeave={() => onSteerChange(0)}
          className="w-16 h-16 sm:w-18 sm:h-18 bg-amber-950/70 active:bg-amber-600 backdrop-blur-md rounded-2xl border-2 border-amber-400/40 text-amber-200 flex items-center justify-center shadow-xl active:scale-95 transition-transform touch-none select-none"
          aria-label="Steer Right"
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Brake & Nitro Boost Pedals */}
      <div className="flex gap-3 pointer-events-auto">
        {/* Brake */}
        <button
          type="button"
          onPointerDown={() => onBrakeChange(true)}
          onPointerUp={() => onBrakeChange(false)}
          onPointerLeave={() => onBrakeChange(false)}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-950/70 active:bg-rose-600 backdrop-blur-md rounded-2xl border-2 border-rose-400/40 text-rose-200 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform touch-none select-none"
          aria-label="Brake"
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase">Brake</span>
        </button>

        {/* Nitro Boost */}
        <button
          type="button"
          onPointerDown={() => {
            soundManager.unlockAudio();
            soundManager.playNitro();
            onBoostChange(true);
          }}
          onPointerUp={() => onBoostChange(false)}
          onPointerLeave={() => onBoostChange(false)}
          className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-tr from-amber-600 to-yellow-500 active:from-yellow-400 active:to-amber-500 text-slate-950 font-fun font-bold rounded-2xl border-2 border-yellow-300 flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform touch-none select-none animate-pulse-glow"
          aria-label="Boost"
        >
          <Zap className="w-7 h-7 fill-slate-950" />
          <span className="text-xs uppercase font-extrabold tracking-wider">NITRO</span>
        </button>
      </div>
    </div>
  );
};
