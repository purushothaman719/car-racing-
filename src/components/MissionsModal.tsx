import React from 'react';
import { Mission } from '../types';
import { X, Award, CheckCircle2, Gift } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  missions: Mission[];
  onClaimReward: (missionId: string, reward: number) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<Props> = ({
  missions,
  onClaimReward,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-gradient-to-b from-amber-950 to-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-800/40 bg-amber-900/30">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-fun font-bold text-amber-200">Bakery Missions</h2>
              <p className="text-xs text-amber-300/70">Complete driving challenges to earn cookie rewards</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
          {missions.map((m) => {
            const progress = Math.min(100, (m.currentCount / m.targetCount) * 100);
            const isDone = m.currentCount >= m.targetCount;

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-fun font-bold text-base text-white">{m.title}</h3>
                    <p className="text-xs text-zinc-300">{m.description}</p>
                  </div>

                  {/* Claim or Status Badge */}
                  {m.claimed ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-white/5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Claimed</span>
                    </div>
                  ) : isDone ? (
                    <button
                      onClick={() => {
                        soundManager.playGoldenCookie();
                        onClaimReward(m.id, m.rewardCookies);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fun font-bold text-xs flex items-center gap-1.5 shadow-md animate-bounce cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Claim +{m.rewardCookies} 🍪</span>
                    </button>
                  ) : (
                    <div className="text-xs font-fun font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-500/30">
                      +{m.rewardCookies} 🍪
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400">
                    {m.currentCount} / {m.targetCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
