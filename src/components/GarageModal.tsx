import React, { useState } from 'react';
import { Vehicle, VehicleUpgrades } from '../types';
import { UPGRADE_COSTS } from '../data/vehicles';
import { 
  X, 
  Check, 
  Lock, 
  Gauge, 
  Zap, 
  Compass, 
  Magnet, 
  ShieldCheck, 
  Sparkles,
  ArrowUpCircle
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  vehicles: Vehicle[];
  currentVehicleId: string;
  upgrades: Record<string, VehicleUpgrades>;
  totalCookies: number;
  onSelectVehicle: (id: string) => void;
  onUnlockVehicle: (id: string, cost: number) => void;
  onUpgradeStat: (vehicleId: string, statKey: keyof VehicleUpgrades, cost: number) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<Props> = ({
  vehicles,
  currentVehicleId,
  upgrades,
  totalCookies,
  onSelectVehicle,
  onUnlockVehicle,
  onUpgradeStat,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentVehicleId);
  const activeVehicle = vehicles.find((v) => v.id === selectedId) || vehicles[0];
  const vehicleUpgrades = upgrades[activeVehicle.id] || {
    topSpeedLevel: 1,
    accelerationLevel: 1,
    handlingLevel: 1,
    magnetLevel: 1,
    cookieBonusLevel: 1,
  };

  const getUpgradeCost = (level: number) => {
    return UPGRADE_COSTS[level - 1] || 9999;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-amber-950/95 to-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-amber-800/40 bg-amber-900/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏎️</span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-fun font-bold text-amber-200">Sweet Garage</h2>
              <p className="text-xs sm:text-sm text-amber-300/70">Tune your bakery hot-rods and unlock confectionery racers</p>
            </div>
          </div>

          {/* Cookies Bank & Close */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-2xl border border-amber-500/50 shadow-inner">
              <span className="text-xl">🍪</span>
              <div className="text-right">
                <span className="text-[10px] text-amber-400 font-semibold uppercase block">Bank</span>
                <span className="text-lg font-fun font-bold text-yellow-300 leading-none">
                  {totalCookies.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Vehicle Grid List (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80">Available Vehicles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 overflow-y-auto max-h-[480px] pr-1">
              {vehicles.map((v) => {
                const isCurrent = v.id === currentVehicleId;
                const isSelected = v.id === activeVehicle.id;

                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedId(v.id);
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-800/40 border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.01]'
                        : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Car color dot / icon preview */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white/20 shadow-md font-fun font-bold text-white text-xs"
                        style={{ backgroundColor: v.color }}
                      >
                        🚗
                      </div>
                      <div>
                        <div className="font-fun font-bold text-base text-white flex items-center gap-1.5">
                          {v.name}
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-md font-semibold">
                              EQUIPPED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">{v.tagline}</div>
                      </div>
                    </div>

                    {!v.unlocked && (
                      <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-xl border border-amber-500/30 text-xs font-bold text-amber-300">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>{v.price} 🍪</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right / Selected Vehicle Detail & Upgrade Tuning (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-5 bg-zinc-900/50 p-4 sm:p-6 rounded-3xl border border-white/10">
            {/* Vehicle Header & Visual Showcase */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-2xl font-fun font-bold text-amber-200">{activeVehicle.name}</h3>
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                    style={{ backgroundColor: activeVehicle.color, color: '#ffffff' }}
                  >
                    {activeVehicle.style}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 max-w-sm">{activeVehicle.description}</p>
              </div>

              {/* Action Button: Equip or Unlock */}
              {activeVehicle.unlocked ? (
                <button
                  onClick={() => {
                    soundManager.playPowerUp();
                    onSelectVehicle(activeVehicle.id);
                  }}
                  disabled={activeVehicle.id === currentVehicleId}
                  className={`px-5 py-2.5 rounded-2xl font-fun font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeVehicle.id === currentVehicleId
                      ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg hover:scale-105 active:scale-95'
                  }`}
                >
                  {activeVehicle.id === currentVehicleId ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Currently Driving</span>
                    </>
                  ) : (
                    <span>Drive This Car</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (totalCookies >= activeVehicle.price) {
                      soundManager.playPowerUp();
                      onUnlockVehicle(activeVehicle.id, activeVehicle.price);
                    } else {
                      soundManager.playCrash();
                    }
                  }}
                  disabled={totalCookies < activeVehicle.price}
                  className={`px-6 py-2.5 rounded-2xl font-fun font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                    totalCookies >= activeVehicle.price
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 hover:scale-105 active:scale-95'
                      : 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock for {activeVehicle.price} 🍪</span>
                </button>
              )}
            </div>

            {/* Performance Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex items-center gap-2.5">
                <Gauge className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Top Speed</span>
                  <span className="font-fun font-bold text-sm text-white">
                    {activeVehicle.topSpeed + (vehicleUpgrades.topSpeedLevel - 1) * 16} km/h
                  </span>
                </div>
              </div>

              <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Acceleration</span>
                  <span className="font-fun font-bold text-sm text-white">
                    {activeVehicle.acceleration + (vehicleUpgrades.accelerationLevel - 1) * 0.8} / 5
                  </span>
                </div>
              </div>

              <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Handling</span>
                  <span className="font-fun font-bold text-sm text-white">
                    {activeVehicle.handling + (vehicleUpgrades.handlingLevel - 1) * 0.8} / 5
                  </span>
                </div>
              </div>

              <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex items-center gap-2.5">
                <Magnet className="w-5 h-5 text-rose-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Magnet Suction</span>
                  <span className="font-fun font-bold text-sm text-white">
                    +{activeVehicle.magnetRangeBonus + (vehicleUpgrades.magnetLevel - 1) * 35} px
                  </span>
                </div>
              </div>

              <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Durability</span>
                  <span className="font-fun font-bold text-sm text-white">
                    {activeVehicle.shieldDurability} Hearts
                  </span>
                </div>
              </div>

              <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Cookie Multiplier</span>
                  <span className="font-fun font-bold text-sm text-yellow-300">
                    {(activeVehicle.cookieMultiplierBonus + (vehicleUpgrades.cookieBonusLevel - 1) * 0.2).toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrades Section */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-3">
                Bakery Tuning & Upgrades
              </h4>

              <div className="flex flex-col gap-2.5">
                {/* Engine Speed Upgrade */}
                <UpgradeRow
                  title="Vanilla V8 Engine"
                  description="Boosts highway top speed (+16 km/h)"
                  icon={<Gauge className="w-4 h-4 text-sky-400" />}
                  level={vehicleUpgrades.topSpeedLevel}
                  maxLevel={5}
                  cost={getUpgradeCost(vehicleUpgrades.topSpeedLevel)}
                  canAfford={totalCookies >= getUpgradeCost(vehicleUpgrades.topSpeedLevel)}
                  onUpgrade={() => onUpgradeStat(activeVehicle.id, 'topSpeedLevel', getUpgradeCost(vehicleUpgrades.topSpeedLevel))}
                />

                {/* Turbo Acceleration Upgrade */}
                <UpgradeRow
                  title="Cinnamon Nitro Injector"
                  description="Accelerate to top velocity faster"
                  icon={<Zap className="w-4 h-4 text-amber-400" />}
                  level={vehicleUpgrades.accelerationLevel}
                  maxLevel={5}
                  cost={getUpgradeCost(vehicleUpgrades.accelerationLevel)}
                  canAfford={totalCookies >= getUpgradeCost(vehicleUpgrades.accelerationLevel)}
                  onUpgrade={() => onUpgradeStat(activeVehicle.id, 'accelerationLevel', getUpgradeCost(vehicleUpgrades.accelerationLevel))}
                />

                {/* Sugar Grip Handling Upgrade */}
                <UpgradeRow
                  title="Sugar Glaze Grip Tires"
                  description="Tighter steering and responsive lane weaves"
                  icon={<Compass className="w-4 h-4 text-emerald-400" />}
                  level={vehicleUpgrades.handlingLevel}
                  maxLevel={5}
                  cost={getUpgradeCost(vehicleUpgrades.handlingLevel)}
                  canAfford={totalCookies >= getUpgradeCost(vehicleUpgrades.handlingLevel)}
                  onUpgrade={() => onUpgradeStat(activeVehicle.id, 'handlingLevel', getUpgradeCost(vehicleUpgrades.handlingLevel))}
                />

                {/* Magnet Upgrade */}
                <UpgradeRow
                  title="Molasses Magnet Antenna"
                  description="Widens cookie collection pull radius"
                  icon={<Magnet className="w-4 h-4 text-rose-400" />}
                  level={vehicleUpgrades.magnetLevel}
                  maxLevel={5}
                  cost={getUpgradeCost(vehicleUpgrades.magnetLevel)}
                  canAfford={totalCookies >= getUpgradeCost(vehicleUpgrades.magnetLevel)}
                  onUpgrade={() => onUpgradeStat(activeVehicle.id, 'magnetLevel', getUpgradeCost(vehicleUpgrades.magnetLevel))}
                />

                {/* Cookie Bonus Multiplier Upgrade */}
                <UpgradeRow
                  title="Golden Sprinkles Coating"
                  description="Multiplies cookie score and reward payouts"
                  icon={<Sparkles className="w-4 h-4 text-yellow-400" />}
                  level={vehicleUpgrades.cookieBonusLevel}
                  maxLevel={5}
                  cost={getUpgradeCost(vehicleUpgrades.cookieBonusLevel)}
                  canAfford={totalCookies >= getUpgradeCost(vehicleUpgrades.cookieBonusLevel)}
                  onUpgrade={() => onUpgradeStat(activeVehicle.id, 'cookieBonusLevel', getUpgradeCost(vehicleUpgrades.cookieBonusLevel))}
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

interface UpgradeRowProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  level: number;
  maxLevel: number;
  cost: number;
  canAfford: boolean;
  onUpgrade: () => void;
}

const UpgradeRow: React.FC<UpgradeRowProps> = ({
  title,
  description,
  icon,
  level,
  maxLevel,
  cost,
  canAfford,
  onUpgrade,
}) => {
  const isMax = level >= maxLevel;

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-zinc-800/80 border border-white/10">
          {icon}
        </div>
        <div>
          <div className="font-fun font-bold text-sm text-white flex items-center gap-2">
            {title}
            <span className="text-[11px] text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30">
              Lv. {level}/{maxLevel}
            </span>
          </div>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>
      </div>

      <div>
        {isMax ? (
          <span className="text-xs font-fun font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            MAX LEVEL
          </span>
        ) : (
          <button
            onClick={() => {
              if (canAfford) {
                soundManager.playPowerUp();
                onUpgrade();
              } else {
                soundManager.playCrash();
              }
            }}
            disabled={!canAfford}
            className={`px-3.5 py-1.5 rounded-xl font-fun font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              canAfford
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:scale-105 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Upgrade ({cost} 🍪)</span>
          </button>
        )}
      </div>
    </div>
  );
};
