/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats, Vehicle, VehicleUpgrades, Mission } from './types';
import { INITIAL_VEHICLES, DEFAULT_UPGRADES } from './data/vehicles';
import { INITIAL_MISSIONS } from './data/missions';
import { CookieGameCanvas } from './components/CookieGameCanvas';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { GarageModal } from './components/GarageModal';
import { MissionsModal } from './components/MissionsModal';
import { GameOverModal } from './components/GameOverModal';
import { soundManager } from './utils/audio';

const STORAGE_KEY_COOKIES = 'cookie_drive_bank';
const STORAGE_KEY_HIGHSCORE = 'cookie_drive_highscore';
const STORAGE_KEY_VEHICLES = 'cookie_drive_vehicles';
const STORAGE_KEY_UPGRADES = 'cookie_drive_upgrades';
const STORAGE_KEY_CURRENT_VEHICLE = 'cookie_drive_active_vehicle';
const STORAGE_KEY_MISSIONS = 'cookie_drive_missions';

export default function App() {
  // Persistence Loading
  const [totalCookies, setTotalCookies] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COOKIES);
    return saved ? parseInt(saved, 10) : 50; // Give 50 starting cookies!
  });

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HIGHSCORE);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VEHICLES);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [upgrades, setUpgrades] = useState<Record<string, VehicleUpgrades>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_UPGRADES);
    return saved ? JSON.parse(saved) : DEFAULT_UPGRADES;
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_VEHICLE);
    return saved || 'cookie-cruiser';
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  // Game Lifecycle States
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'GARAGE' | 'MISSIONS' | null>(null);

  // Touch Controller State
  const [touchSteerDirection, setTouchSteerDirection] = useState<number>(0);
  const [isTouchBoosting, setIsTouchBoosting] = useState<boolean>(false);
  const [isTouchBraking, setIsTouchBraking] = useState<boolean>(false);

  // In-Game Live Stats
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  const [liveStats, setLiveStats] = useState<GameStats>({
    score: 0,
    highScore,
    cookiesCollectedThisRun: 0,
    totalCookiesBank: totalCookies,
    distanceMeters: 0,
    maxCombo: 0,
    currentCombo: 0,
    feverGauge: 0,
    isFeverActive: false,
    nearMissCount: 0,
    obstaclesSmashed: 0,
    speedKmh: 70,
    currentLane: 2,
    health: activeVehicle.shieldDurability,
    maxHealth: activeVehicle.shieldDurability,
  });

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COOKIES, totalCookies.toString());
  }, [totalCookies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HIGHSCORE, highScore.toString());
  }, [highScore]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_UPGRADES, JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_VEHICLE, activeVehicleId);
  }, [activeVehicleId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(missions));
  }, [missions]);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    setAudioMuted((prev) => {
      const next = !prev;
      soundManager.setSettings(next, next, 0.8, 0.8, 0.5);
      return next;
    });
  }, []);

  // Start Game
  const handleStartGame = () => {
    setIsNewHighScore(false);
    setLiveStats({
      score: 0,
      highScore,
      cookiesCollectedThisRun: 0,
      totalCookiesBank: totalCookies,
      distanceMeters: 0,
      maxCombo: 0,
      currentCombo: 0,
      feverGauge: 0,
      isFeverActive: false,
      nearMissCount: 0,
      obstaclesSmashed: 0,
      speedKmh: 70,
      currentLane: 2,
      health: activeVehicle.shieldDurability,
      maxHealth: activeVehicle.shieldDurability,
    });
    setGameState('PLAYING');
  };

  // Pause / Resume
  const togglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      soundManager.stopEngine();
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      soundManager.startEngine();
    }
  };

  // Mission progress updater
  const handleMissionProgress = useCallback((type: string, amount: number) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.type === type && !m.completed) {
          const nextCount = m.currentCount + amount;
          return {
            ...m,
            currentCount: nextCount,
            completed: nextCount >= m.targetCount,
          };
        }
        return m;
      })
    );
  }, []);

  // Claim Mission Reward
  const handleClaimMission = (missionId: string, reward: number) => {
    setTotalCookies((prev) => prev + reward);
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
    );
  };

  // Game Over Handler
  const handleGameOver = useCallback((finalStats: GameStats) => {
    setGameState('GAMEOVER');
    setLiveStats(finalStats);

    // Add collected cookies to player's bank
    setTotalCookies((prev) => prev + finalStats.cookiesCollectedThisRun);

    // Check high score
    if (finalStats.score > highScore) {
      setHighScore(finalStats.score);
      setIsNewHighScore(true);
    }
  }, [highScore]);

  // Live Stats Update from Canvas loop
  const handleStatsUpdate = useCallback((partial: Partial<GameStats>) => {
    setLiveStats((prev) => ({ ...prev, ...partial }));
  }, []);

  // Garage Vehicle Selection & Unlock
  const handleSelectVehicle = (id: string) => {
    setActiveVehicleId(id);
  };

  const handleUnlockVehicle = (id: string, cost: number) => {
    if (totalCookies >= cost) {
      setTotalCookies((prev) => prev - cost);
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, unlocked: true } : v))
      );
      setActiveVehicleId(id);
    }
  };

  // Garage Upgrades
  const handleUpgradeStat = (
    vehicleId: string,
    statKey: keyof VehicleUpgrades,
    cost: number
  ) => {
    if (totalCookies >= cost) {
      setTotalCookies((prev) => prev - cost);
      setUpgrades((prev) => {
        const currentVehicleUps = prev[vehicleId] || {
          topSpeedLevel: 1,
          accelerationLevel: 1,
          handlingLevel: 1,
          magnetLevel: 1,
          cookieBonusLevel: 1,
        };
        return {
          ...prev,
          [vehicleId]: {
            ...currentVehicleUps,
            [statKey]: (currentVehicleUps[statKey] || 1) + 1,
          },
        };
      });
    }
  };

  const unclaimedMissionsCount = missions.filter((m) => m.completed && !m.claimed).length;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans flex flex-col items-center justify-center select-none">
      
      {/* Game Canvas Layer (Active when PLAYING, PAUSED, or GAMEOVER) */}
      {gameState !== 'MENU' && (
        <div className="relative w-full h-full">
          <CookieGameCanvas
            vehicle={activeVehicle}
            upgrades={upgrades[activeVehicle.id] || DEFAULT_UPGRADES['cookie-cruiser']}
            isPaused={gameState === 'PAUSED'}
            onGameOver={handleGameOver}
            onStatsUpdate={handleStatsUpdate}
            onMissionProgress={handleMissionProgress}
            touchSteerDirection={touchSteerDirection}
            isTouchBoosting={isTouchBoosting}
            isTouchBraking={isTouchBraking}
          />

          {/* Active Heads-Up Display */}
          <GameHUD
            stats={liveStats}
            vehicle={activeVehicle}
            isPaused={gameState === 'PAUSED'}
            onTogglePause={togglePause}
            audioMuted={audioMuted}
            onToggleAudio={toggleAudio}
            onOpenGarage={() => setActiveModal('GARAGE')}
            onOpenMissions={() => setActiveModal('MISSIONS')}
          />

          {/* On-screen Touch Controls */}
          {gameState === 'PLAYING' && (
            <TouchControls
              onSteerChange={setTouchSteerDirection}
              onBoostChange={setIsTouchBoosting}
              onBrakeChange={setIsTouchBraking}
            />
          )}

          {/* Paused Overlay */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn">
              <div className="bg-gradient-to-b from-amber-950 to-zinc-950 border border-amber-500/40 rounded-3xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
                <span className="text-5xl block mb-2">⏸️</span>
                <h3 className="text-3xl font-fun font-bold text-amber-200 mb-1">Game Paused</h3>
                <p className="text-xs text-zinc-300 mb-6">Take a quick breather or change bakery settings</p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      togglePause();
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-fun font-bold text-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    Resume Drive
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveModal('GARAGE');
                    }}
                    className="w-full py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-200 font-fun font-bold text-sm border border-amber-500/30 transition-all cursor-pointer"
                  >
                    Sweet Garage
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      soundManager.stopEngine();
                      setGameState('MENU');
                    }}
                    className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-fun text-sm border border-white/10 transition-all cursor-pointer"
                  >
                    Quit to Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          vehicle={activeVehicle}
          highScore={highScore}
          totalCookies={totalCookies}
          unclaimedMissionsCount={unclaimedMissionsCount}
          onStartGame={handleStartGame}
          onOpenGarage={() => setActiveModal('GARAGE')}
          onOpenMissions={() => setActiveModal('MISSIONS')}
          audioMuted={audioMuted}
          onToggleAudio={toggleAudio}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={liveStats}
          isNewHighScore={isNewHighScore}
          onRestart={handleStartGame}
          onOpenGarage={() => setActiveModal('GARAGE')}
          onReturnHome={() => setGameState('MENU')}
        />
      )}

      {/* Garage Modal */}
      {activeModal === 'GARAGE' && (
        <GarageModal
          vehicles={vehicles}
          currentVehicleId={activeVehicleId}
          upgrades={upgrades}
          totalCookies={totalCookies}
          onSelectVehicle={handleSelectVehicle}
          onUnlockVehicle={handleUnlockVehicle}
          onUpgradeStat={handleUpgradeStat}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Missions Modal */}
      {activeModal === 'MISSIONS' && (
        <MissionsModal
          missions={missions}
          onClaimReward={handleClaimMission}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}
