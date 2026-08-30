import React, { useEffect, useRef, useCallback } from 'react';
import { 
  CookieEntity, 
  ObstacleEntity, 
  PowerUpEntity, 
  Particle, 
  Vehicle, 
  VehicleUpgrades, 
  ActivePowerUp, 
  GameStats, 
  CookieType, 
  ObstacleType, 
  PowerUpType 
} from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  vehicle: Vehicle;
  upgrades: VehicleUpgrades;
  isPaused: boolean;
  onGameOver: (stats: GameStats) => void;
  onStatsUpdate: (stats: Partial<GameStats>) => void;
  onMissionProgress: (type: string, amount: number) => void;
  touchSteerDirection: number; // -1 (left), 0 (none), 1 (right)
  isTouchBoosting: boolean;
  isTouchBraking: boolean;
}

export const CookieGameCanvas: React.FC<Props> = ({
  vehicle,
  upgrades,
  isPaused,
  onGameOver,
  onStatsUpdate,
  onMissionProgress,
  touchSteerDirection,
  isTouchBoosting,
  isTouchBraking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game State in Ref to avoid closures in 60fps loop
  const stateRef = useRef({
    // Car position & motion
    carX: 0.5, // 0 (left edge of road) to 1 (right edge)
    carTargetX: 0.5,
    carVx: 0,
    carAngle: 0,
    speed: 70, // current speed in km/h
    targetSpeed: 90,
    baseMaxSpeed: vehicle.topSpeed + (upgrades.topSpeedLevel - 1) * 15,
    distanceDriven: 0,
    roadScrollY: 0,

    // Controls state
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false,
    },

    // Health & Score
    health: vehicle.shieldDurability,
    maxHealth: vehicle.shieldDurability,
    score: 0,
    cookiesRun: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    feverGauge: 0,
    isFeverActive: false,
    feverTimer: 0,
    nearMissCount: 0,
    obstaclesSmashed: 0,
    invincibleTimer: 0, // after taking damage

    // Active powerups
    activePowerUps: new Map<PowerUpType, ActivePowerUp>(),

    // Spawning entities
    cookies: [] as CookieEntity[],
    obstacles: [] as ObstacleEntity[],
    powerUps: [] as PowerUpEntity[],
    particles: [] as Particle[],
    skidMarks: [] as { x: number; y: number; alpha: number; angle: number }[],

    // Timing & Spawn control
    lastSpawnDistance: 0,
    lastObstacleDistance: 0,
    nextObstacleGap: 180,
    lastTrafficId: 1,
    lastCookieId: 1,
    isGameOver: false,
    roadTime: 0,
  });

  // Effective vehicle stats calculated with upgrades
  const effectiveStats = {
    topSpeed: vehicle.topSpeed + (upgrades.topSpeedLevel - 1) * 16,
    accel: vehicle.acceleration + (upgrades.accelerationLevel - 1) * 0.8,
    handling: vehicle.handling + (upgrades.handlingLevel - 1) * 0.8,
    magnetRadius: 100 + vehicle.magnetRangeBonus + (upgrades.magnetLevel - 1) * 35,
    cookieMultiplier: vehicle.cookieMultiplierBonus + (upgrades.cookieBonusLevel - 1) * 0.2,
  };

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) k.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) k.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) k.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) k.down = true;
      if (['Space'].includes(e.code)) {
        k.space = true;
        e.preventDefault();
      }
      soundManager.unlockAudio();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) k.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) k.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) k.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) k.down = false;
      if (['Space'].includes(e.code)) k.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Audio start on mount
  useEffect(() => {
    soundManager.startEngine();
    soundManager.startBGM();
    return () => {
      soundManager.stopEngine();
      soundManager.stopBGM();
    };
  }, []);

  // Spawn Helpers
  const spawnCookieCluster = useCallback((baseY: number) => {
    const s = stateRef.current;
    const lanePositions = [0.15, 0.38, 0.62, 0.85];
    const patternType = Math.random();

    // Determine cookie type
    const roll = Math.random();
    let type: CookieType = 'CHOC_CHIP';
    let points = 10;
    let cookieVal = 1;

    if (roll > 0.94) {
      type = 'COOKIE_JAR';
      points = 100;
      cookieVal = 10;
    } else if (roll > 0.86) {
      type = 'RAINBOW';
      points = 50;
      cookieVal = 5;
    } else if (roll > 0.72) {
      type = 'GOLDEN';
      points = 35;
      cookieVal = 3;
    } else if (roll > 0.55) {
      type = 'DOUBLE_CHOC';
      points = 20;
      cookieVal = 2;
    }

    if (patternType < 0.35) {
      // Straight line down a lane
      const lane = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      for (let i = 0; i < 4; i++) {
        s.cookies.push({
          id: s.lastCookieId++,
          x: lane,
          y: baseY - i * 45,
          type,
          points,
          cookieValue: cookieVal,
          radius: type === 'COOKIE_JAR' ? 22 : 16,
          rotation: Math.random() * Math.PI * 2,
          spinSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    } else if (patternType < 0.7) {
      // Wave / Zigzag across lanes
      const startLaneIdx = Math.floor(Math.random() * 2);
      for (let i = 0; i < 4; i++) {
        const laneX = lanePositions[(startLaneIdx + i) % lanePositions.length];
        s.cookies.push({
          id: s.lastCookieId++,
          x: laneX,
          y: baseY - i * 40,
          type,
          points,
          cookieValue: cookieVal,
          radius: 16,
          rotation: Math.random() * Math.PI * 2,
          spinSpeed: 0.03,
        });
      }
    } else {
      // Wide cluster
      const lane1 = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      const lane2 = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      s.cookies.push(
        {
          id: s.lastCookieId++,
          x: lane1,
          y: baseY,
          type,
          points,
          cookieValue: cookieVal,
          radius: 16,
          rotation: 0,
          spinSpeed: 0.02,
        },
        {
          id: s.lastCookieId++,
          x: lane2,
          y: baseY - 35,
          type: Math.random() > 0.5 ? 'GOLDEN' : type,
          points: 35,
          cookieValue: 3,
          radius: 16,
          rotation: 0,
          spinSpeed: 0.02,
        }
      );
    }

    // Occasional PowerUp Spawn
    if (Math.random() < 0.18) {
      const powerUpTypes: PowerUpType[] = ['MAGNET', 'SHIELD', 'NITRO', 'DOUBLE_POINTS', 'SLOW_MO'];
      const pType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const lane = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      s.powerUps.push({
        id: s.lastCookieId++,
        x: lane,
        y: baseY - 120,
        type: pType,
        duration: pType === 'SHIELD' ? 12 : 8,
        radius: 20,
        rotation: 0,
      });
    }
  }, []);

  const spawnObstacle = useCallback((baseY: number) => {
    const s = stateRef.current;
    const lanePositions = [0.15, 0.38, 0.62, 0.85];
    const laneIdx = Math.floor(Math.random() * lanePositions.length);
    const laneX = lanePositions[laneIdx];

    const types: ObstacleType[] = ['TRAFFIC_CAR', 'DELIVERY_VAN', 'OIL_SLICK', 'ROLLING_PIN', 'DONUT_BARRIER'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let width = 36;
    let height = 64;
    let speed = 40 + Math.random() * 25; // traffic speed
    const colors = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0d9488', '#e11d48'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (chosenType === 'DELIVERY_VAN') {
      width = 44;
      height = 80;
      speed = 35 + Math.random() * 15;
    } else if (chosenType === 'OIL_SLICK') {
      width = 50;
      height = 42;
      speed = 0;
    } else if (chosenType === 'DONUT_BARRIER') {
      width = 48;
      height = 40;
      speed = 0;
    } else if (chosenType === 'ROLLING_PIN') {
      width = 60;
      height = 24;
      speed = 10;
    }

    s.obstacles.push({
      id: s.lastTrafficId++,
      x: laneX,
      y: baseY,
      width,
      height,
      type: chosenType,
      speed,
      lane: laneIdx,
      color,
      driftAngle: 0,
    });
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas || isPaused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const s = stateRef.current;
      if (s.isGameOver) {
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      const roadLeft = W * 0.14;
      const roadWidth = W * 0.72;
      const roadRight = roadLeft + roadWidth;

      // 1. UPDATE CONTROLS & SPEED
      const isBoosting = s.keys.up || s.keys.space || isTouchBoosting;
      const isBraking = s.keys.down || isTouchBraking;
      const hasNitroPower = s.activePowerUps.has('NITRO');
      const hasSlowMo = s.activePowerUps.has('SLOW_MO');

      let targetMaxSpeed = effectiveStats.topSpeed;
      if (hasNitroPower || s.isFeverActive) {
        targetMaxSpeed *= 1.4;
      }

      if (isBoosting) {
        s.targetSpeed = targetMaxSpeed;
      } else if (isBraking) {
        s.targetSpeed = 40;
      } else {
        s.targetSpeed = targetMaxSpeed * 0.75;
      }

      // Smooth accelerate
      const accelRate = (isBoosting ? effectiveStats.accel * 40 : 25) * dt;
      if (s.speed < s.targetSpeed) {
        s.speed = Math.min(s.targetSpeed, s.speed + accelRate);
      } else {
        s.speed = Math.max(s.targetSpeed, s.speed - 35 * dt);
      }

      // Audio engine update
      soundManager.updateEnginePitch(s.speed / effectiveStats.topSpeed, isBoosting || hasNitroPower || s.isFeverActive);

      // Steering
      let steerInput = 0;
      if (s.keys.left) steerInput -= 1;
      if (s.keys.right) steerInput += 1;
      if (touchSteerDirection !== 0) steerInput += touchSteerDirection;

      const steerAgility = (effectiveStats.handling * 0.9) * (0.6 + 0.4 * (s.speed / 100));
      s.carVx = s.carVx * 0.85 + (steerInput * steerAgility * dt * 2.2);
      s.carX = Math.max(0.04, Math.min(0.96, s.carX + s.carVx));

      // Car tilt angle
      const targetAngle = s.carVx * 18;
      s.carAngle = s.carAngle * 0.8 + targetAngle * 0.2;

      // Distance and Road movement
      const speedMs = (s.speed * 1000) / 3600; // in m/s
      const frameDistance = speedMs * dt;
      s.distanceDriven += frameDistance;
      s.roadScrollY = (s.roadScrollY + (s.speed * 4.5 * dt)) % 100;
      s.roadTime += dt;

      // Skid marks during hard steering or high speed
      if (Math.abs(s.carVx) > 0.012 || (isBraking && s.speed > 80)) {
        if (Math.random() < 0.4) {
          soundManager.playDrift();
        }
        const carPixelX = roadLeft + s.carX * roadWidth;
        const carPixelY = H * 0.76;
        s.skidMarks.push({
          x: carPixelX - 14,
          y: carPixelY + 20,
          alpha: 0.6,
          angle: s.carAngle,
        });
        s.skidMarks.push({
          x: carPixelX + 14,
          y: carPixelY + 20,
          alpha: 0.6,
          angle: s.carAngle,
        });
      }

      // Decay skid marks
      for (let i = s.skidMarks.length - 1; i >= 0; i--) {
        s.skidMarks[i].y += (s.speed * 4.5 * dt);
        s.skidMarks[i].alpha -= 0.6 * dt;
        if (s.skidMarks[i].alpha <= 0 || s.skidMarks[i].y > H + 50) {
          s.skidMarks.splice(i, 1);
        }
      }

      // Combo & Fever Timers
      if (s.comboTimer > 0) {
        s.comboTimer -= dt;
        if (s.comboTimer <= 0) {
          s.combo = 0;
        }
      }

      if (s.isFeverActive) {
        s.feverTimer -= dt;
        s.feverGauge = Math.max(0, (s.feverTimer / 8) * 100);
        if (s.feverTimer <= 0) {
          s.isFeverActive = false;
          s.feverGauge = 0;
        }
      }

      if (s.invincibleTimer > 0) {
        s.invincibleTimer -= dt;
      }

      // PowerUps Expiry
      const now = performance.now();
      s.activePowerUps.forEach((p, type) => {
        if (now > p.expiresAt) {
          s.activePowerUps.delete(type);
        }
      });

      // 2. SPAWNING ENTITIES
      if (s.distanceDriven - s.lastSpawnDistance > 25) {
        s.lastSpawnDistance = s.distanceDriven;
        spawnCookieCluster(-80);
      }

      if (s.distanceDriven - s.lastObstacleDistance > s.nextObstacleGap) {
        s.lastObstacleDistance = s.distanceDriven;
        // Traffic frequency escalates with distance
        s.nextObstacleGap = Math.max(90, 190 - Math.min(80, s.distanceDriven * 0.04));
        spawnObstacle(-100);
      }

      // Car Hitbox & Coordinates
      const carPixelX = roadLeft + s.carX * roadWidth;
      const carPixelY = H * 0.76;
      const carW = vehicle.style === 'truck' ? 44 : 36;
      const carH = vehicle.style === 'truck' ? 78 : 64;

      const hasShield = s.activePowerUps.has('SHIELD') || s.isFeverActive;
      const hasMagnet = s.activePowerUps.has('MAGNET') || s.isFeverActive;
      const magnetDist = hasMagnet ? effectiveStats.magnetRadius * 2.2 : effectiveStats.magnetRadius;

      // 3. COOKIE UPDATES & MAGNET ATTRACTION
      for (let i = s.cookies.length - 1; i >= 0; i--) {
        const c = s.cookies[i];
        // Move with road speed
        c.y += (s.speed * 4.5 * dt);
        c.rotation += c.spinSpeed;

        const cookiePixelX = roadLeft + c.x * roadWidth;
        const cookiePixelY = c.y;

        // Distance to car
        const dx = carPixelX - cookiePixelX;
        const dy = carPixelY - cookiePixelY;
        const dist = Math.hypot(dx, dy);

        // Magnet attraction
        if (dist < magnetDist) {
          c.isMagnetized = true;
          const pullForce = (1 - dist / magnetDist) * 700 * dt;
          c.x += (dx / dist) * (pullForce / roadWidth);
          c.y += (dy / dist) * pullForce;
        }

        // Collision with Car
        if (dist < c.radius + carW * 0.6) {
          // Collected!
          const comboMultiplier = 1 + Math.min(4, Math.floor(s.combo / 5) * 0.5);
          const feverMultiplier = s.isFeverActive ? 2.5 : 1.0;
          const doubleMultiplier = s.activePowerUps.has('DOUBLE_POINTS') ? 2.0 : 1.0;
          const totalPoints = Math.round(c.points * effectiveStats.cookieMultiplier * comboMultiplier * feverMultiplier * doubleMultiplier);
          const totalCookies = Math.round(c.cookieValue * effectiveStats.cookieMultiplier);

          s.score += totalPoints;
          s.cookiesRun += totalCookies;
          s.combo += 1;
          s.comboTimer = 3.5;
          if (s.combo > s.maxCombo) s.maxCombo = s.combo;

          // Increase fever meter
          if (!s.isFeverActive) {
            s.feverGauge = Math.min(100, s.feverGauge + 6);
            if (s.feverGauge >= 100) {
              s.isFeverActive = true;
              s.feverTimer = 8; // 8s of Fever frenzy
              soundManager.playFeverFanfare();
              onMissionProgress('ACTIVATE_FEVER', 1);
            }
          }

          // Play appropriate audio & spawn particles
          if (c.type === 'GOLDEN' || c.type === 'COOKIE_JAR') {
            soundManager.playGoldenCookie();
            onMissionProgress('COLLECT_GOLDEN', 1);
          } else {
            soundManager.playCookiePickup(1 + (s.combo % 10) * 0.05);
          }
          onMissionProgress('COLLECT_COOKIES', totalCookies);

          // Crumbs particle burst
          for (let p = 0; p < 8; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 140;
            s.particles.push({
              x: cookiePixelX,
              y: cookiePixelY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 50,
              life: 0.5,
              maxLife: 0.5,
              color: c.type === 'GOLDEN' ? '#fbbf24' : (c.type === 'RAINBOW' ? '#f43f5e' : '#b45309'),
              size: 4 + Math.random() * 4,
              shape: 'crumb',
            });
          }

          // Floating score text
          s.particles.push({
            x: cookiePixelX,
            y: cookiePixelY - 15,
            vx: (Math.random() - 0.5) * 20,
            vy: -70,
            life: 0.8,
            maxLife: 0.8,
            color: c.type === 'GOLDEN' ? '#fef08a' : '#ffffff',
            size: 14,
            shape: 'text',
            text: `+${totalPoints}`,
          });

          s.cookies.splice(i, 1);
          continue;
        }

        // Out of screen
        if (c.y > H + 80) {
          s.cookies.splice(i, 1);
        }
      }

      // 4. POWER-UP ITEMS UPDATES
      for (let i = s.powerUps.length - 1; i >= 0; i--) {
        const p = s.powerUps[i];
        p.y += (s.speed * 4.5 * dt);
        p.rotation += 0.04;

        const pX = roadLeft + p.x * roadWidth;
        const pY = p.y;
        const dist = Math.hypot(carPixelX - pX, carPixelY - pY);

        if (dist < p.radius + carW * 0.7) {
          // Collected power-up
          s.activePowerUps.set(p.type, {
            type: p.type,
            expiresAt: performance.now() + p.duration * 1000,
            duration: p.duration,
          });

          soundManager.playPowerUp();

          // Sparkle burst
          for (let k = 0; k < 15; k++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 80 + Math.random() * 180;
            s.particles.push({
              x: pX,
              y: pY,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 0.7,
              maxLife: 0.7,
              color: '#38bdf8',
              size: 5,
              shape: 'sparkle',
            });
          }

          s.particles.push({
            x: pX,
            y: pY - 25,
            vx: 0,
            vy: -80,
            life: 1.0,
            maxLife: 1.0,
            color: '#38bdf8',
            size: 16,
            shape: 'text',
            text: `${p.type.replace('_', ' ')}!`,
          });

          s.powerUps.splice(i, 1);
          continue;
        }

        if (p.y > H + 80) {
          s.powerUps.splice(i, 1);
        }
      }

      // 5. OBSTACLES & TRAFFIC UPDATES
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        // Relative road movement
        const effectiveObsSpeed = hasSlowMo ? obs.speed * 0.4 : obs.speed;
        const obsDy = (s.speed - effectiveObsSpeed) * 4.5 * dt;
        obs.y += obsDy;

        const obsX = roadLeft + obs.x * roadWidth;
        const obsY = obs.y;

        // Collision Check (AABB with rounded padding)
        const hitX = Math.abs(carPixelX - obsX) < (carW + obs.width) * 0.42;
        const hitY = Math.abs(carPixelY - obsY) < (carH + obs.height) * 0.42;

        // Near-miss detection (driving super close without hitting)
        const nearMissX = Math.abs(carPixelX - obsX) < (carW + obs.width) * 0.7;
        const nearMissY = Math.abs(carPixelY - obsY) < (carH + obs.height) * 0.6;
        if (nearMissX && nearMissY && !hitX && !hitY && !(obs as { nearMissAwarded?: boolean }).nearMissAwarded) {
          (obs as { nearMissAwarded?: boolean }).nearMissAwarded = true;
          s.nearMissCount += 1;
          s.score += 75;
          onMissionProgress('NEAR_MISSES', 1);

          s.particles.push({
            x: carPixelX + (carPixelX < obsX ? -30 : 30),
            y: carPixelY - 20,
            vx: 0,
            vy: -70,
            life: 0.8,
            maxLife: 0.8,
            color: '#ec4899',
            size: 15,
            shape: 'text',
            text: 'SWEET DODGE! +75',
          });
        }

        if (hitX && hitY && !obs.isHit) {
          obs.isHit = true;

          // If shielded or Fever mode: SMASH THROUGH OBSTACLE
          if (hasShield || s.invincibleTimer > 0) {
            soundManager.playShieldSmash();
            s.obstaclesSmashed += 1;
            s.score += 250;

            // Explosion particles
            for (let k = 0; k < 20; k++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 120 + Math.random() * 200;
              s.particles.push({
                x: obsX,
                y: obsY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 0.6,
                maxLife: 0.6,
                color: obs.color || '#fbbf24',
                size: 6,
                shape: 'sparkle',
              });
            }

            s.particles.push({
              x: obsX,
              y: obsY - 20,
              vx: 0,
              vy: -90,
              life: 0.9,
              maxLife: 0.9,
              color: '#38bdf8',
              size: 16,
              shape: 'text',
              text: 'SMASH! +250',
            });

            // If regular shield (not fever), consume it
            if (!s.isFeverActive && s.activePowerUps.has('SHIELD')) {
              s.activePowerUps.delete('SHIELD');
            }

            s.obstacles.splice(i, 1);
            continue;
          } else {
            // Take damage / Crash
            soundManager.playCrash();
            s.health -= 1;
            s.invincibleTimer = 1.8; // Brief invincibility after hit
            s.speed = Math.max(30, s.speed * 0.4); // Stumble slow down
            s.combo = 0; // Break combo

            // Crash fire / sparks
            for (let k = 0; k < 25; k++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 100 + Math.random() * 250;
              s.particles.push({
                x: carPixelX,
                y: carPixelY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 0.8,
                maxLife: 0.8,
                color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b',
                size: 6,
                shape: 'fire',
              });
            }

            if (s.health <= 0) {
              // GAME OVER
              s.isGameOver = true;
              soundManager.stopEngine();
              onGameOver({
                score: s.score,
                highScore: Math.max(s.score, 0),
                cookiesCollectedThisRun: s.cookiesRun,
                totalCookiesBank: 0,
                distanceMeters: Math.round(s.distanceDriven),
                maxCombo: s.maxCombo,
                currentCombo: 0,
                feverGauge: 0,
                isFeverActive: false,
                nearMissCount: s.nearMissCount,
                obstaclesSmashed: s.obstaclesSmashed,
                speedKmh: Math.round(s.speed),
                currentLane: 2,
                health: 0,
                maxHealth: s.maxHealth,
              });
              return;
            }
          }
        }

        // Offscreen removal
        if (obs.y > H + 120 || obs.y < -300) {
          s.obstacles.splice(i, 1);
        }
      }

      // 6. PARTICLES UPDATE
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // Update parent UI stats every few frames
      onStatsUpdate({
        score: s.score,
        cookiesCollectedThisRun: s.cookiesRun,
        distanceMeters: Math.round(s.distanceDriven),
        currentCombo: s.combo,
        maxCombo: s.maxCombo,
        feverGauge: s.feverGauge,
        isFeverActive: s.isFeverActive,
        speedKmh: Math.round(s.speed),
        health: s.health,
        maxHealth: s.maxHealth,
      });

      onMissionProgress('SCORE_POINTS', s.score);
      onMissionProgress('DRIVE_DISTANCE', Math.round(s.distanceDriven));

      // ==========================================
      // 7. CANVAS RENDERING PASS
      // ==========================================
      ctx.clearRect(0, 0, W, H);

      // A. Draw Scrolling Grass & Candyland Roadside Scenery
      const grassPatternColor = s.isFeverActive ? '#3b0764' : '#14532d'; // Vibrant dark candy greens / fever violet
      ctx.fillStyle = grassPatternColor;
      ctx.fillRect(0, 0, W, H);

      // Parallax Pastry Trees & Bakery Silhouettes on roadside
      const treeSpacing = 160;
      const treeOffset = (s.roadScrollY * 3.5) % treeSpacing;
      for (let y = -treeSpacing; y < H + treeSpacing; y += treeSpacing) {
        const drawY = y + treeOffset;
        // Left roadside candy trees
        ctx.fillStyle = '#ec4899'; // Pink Cotton Candy Tree
        ctx.beginPath();
        ctx.arc(roadLeft * 0.45, drawY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(roadLeft * 0.45 - 5, drawY - 5, 12, 0, Math.PI * 2);
        ctx.fill();

        // Right roadside chocolate gingerbread trees
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(roadRight + (W - roadRight) * 0.55, drawY + 80, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a'; // Sugar sprinkle
        ctx.fillRect(roadRight + (W - roadRight) * 0.55 - 4, drawY + 76, 8, 8);
      }

      // B. Asphalt Road Surface
      ctx.fillStyle = s.isFeverActive ? '#1e1b4b' : '#27272a'; // Deep asphalt
      ctx.fillRect(roadLeft, 0, roadWidth, H);

      // Red & White Candy Curb Edges
      const curbWidth = 14;
      const stripeHeight = 35;
      const curbOffset = (s.roadScrollY * 2) % (stripeHeight * 2);

      for (let y = -stripeHeight * 2; y < H + stripeHeight * 2; y += stripeHeight) {
        const stripeY = y + curbOffset;
        const isRed = Math.floor((y - curbOffset) / stripeHeight) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';

        // Left curb
        ctx.fillRect(roadLeft - curbWidth, stripeY, curbWidth, stripeHeight);
        // Right curb
        ctx.fillRect(roadRight, stripeY, curbWidth, stripeHeight);
      }

      // Lane Divider Dashes
      const laneWidth = roadWidth / 4;
      const dashLength = 40;
      const dashGap = 35;
      const dashTotal = dashLength + dashGap;
      const dashOffset = (s.roadScrollY * 3.5) % dashTotal;

      ctx.fillStyle = s.isFeverActive ? '#ec4899' : '#e4e4e7';
      for (let laneIdx = 1; laneIdx <= 3; laneIdx++) {
        const laneX = roadLeft + laneIdx * laneWidth;
        for (let y = -dashTotal; y < H + dashTotal; y += dashTotal) {
          ctx.fillRect(laneX - 3, y + dashOffset, 6, dashLength);
        }
      }

      // C. Skid Marks
      s.skidMarks.forEach((sm) => {
        ctx.save();
        ctx.translate(sm.x, sm.y);
        ctx.rotate((sm.angle * Math.PI) / 180);
        ctx.fillStyle = `rgba(10, 5, 2, ${sm.alpha * 0.5})`;
        ctx.fillRect(-4, -12, 8, 24);
        ctx.restore();
      });

      // D. Draw PowerUps
      s.powerUps.forEach((p) => {
        const pX = roadLeft + p.x * roadWidth;
        const pY = p.y;

        ctx.save();
        ctx.translate(pX, pY);
        ctx.rotate(p.rotation);

        // Glowing aura
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let symbol = '⚡';
        if (p.type === 'MAGNET') symbol = '🧲';
        if (p.type === 'SHIELD') symbol = '🛡️';
        if (p.type === 'NITRO') symbol = '🚀';
        if (p.type === 'DOUBLE_POINTS') symbol = '2X';
        if (p.type === 'SLOW_MO') symbol = '⏱️';

        ctx.fillText(symbol, 0, 0);
        ctx.restore();
      });

      // E. Draw Cookies
      s.cookies.forEach((c) => {
        const cX = roadLeft + c.x * roadWidth;
        const cY = c.y;

        ctx.save();
        ctx.translate(cX, cY);
        ctx.rotate(c.rotation);

        // Cookie base
        if (c.type === 'GOLDEN') {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 18;
          ctx.fillStyle = '#f59e0b';
        } else if (c.type === 'RAINBOW') {
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#db2777';
        } else if (c.type === 'DOUBLE_CHOC') {
          ctx.shadowColor = '#451a03';
          ctx.shadowBlur = 6;
          ctx.fillStyle = '#3e1e0d';
        } else if (c.type === 'COOKIE_JAR') {
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#38bdf8';
        } else {
          ctx.shadowColor = '#78350f';
          ctx.shadowBlur = 4;
          ctx.fillStyle = '#d97706';
        }

        // Circular cookie body
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cookie crust rim
        ctx.strokeStyle = c.type === 'GOLDEN' ? '#fef08a' : '#92400e';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Chocolate chips / sprinkles
        if (c.type === 'COOKIE_JAR') {
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px Outfit';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🍪', 0, 0);
        } else if (c.type === 'RAINBOW') {
          // Rainbow stars
          const sprinkleColors = ['#fde047', '#4ade80', '#38bdf8', '#c084fc'];
          for (let p = 0; p < 4; p++) {
            const rad = 7;
            const ang = (p * Math.PI) / 2;
            ctx.fillStyle = sprinkleColors[p];
            ctx.fillRect(Math.cos(ang) * rad - 2, Math.sin(ang) * rad - 2, 5, 5);
          }
        } else {
          // Choc chips
          ctx.fillStyle = c.type === 'DOUBLE_CHOC' ? '#ffffff' : '#451a03';
          const chipOffsets = [
            [-5, -4],
            [5, -5],
            [-4, 5],
            [4, 4],
            [0, 0],
          ];
          chipOffsets.forEach(([ox, oy]) => {
            ctx.beginPath();
            ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();
      });

      // F. Draw Obstacles & Traffic
      s.obstacles.forEach((obs) => {
        const obsX = roadLeft + obs.x * roadWidth;
        const obsY = obs.y;

        ctx.save();
        ctx.translate(obsX, obsY);

        if (obs.type === 'OIL_SLICK') {
          // Melted Chocolate / Oil Slick
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.ellipse(0, 0, obs.width * 0.5, obs.height * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#44403c';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (obs.type === 'DONUT_BARRIER') {
          // Giant Frosted Donut
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(0, 0, obs.width * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#27272a';
          ctx.beginPath();
          ctx.arc(0, 0, obs.width * 0.18, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'ROLLING_PIN') {
          // Wooden Rolling Pin
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-obs.width / 2 - 8, -obs.height / 4, 8, obs.height / 2);
          ctx.fillRect(obs.width / 2, -obs.height / 4, 8, obs.height / 2);
        } else {
          // Traffic Vehicles (Sedan / Delivery Van)
          const carColor = obs.color || '#2563eb';

          // Car Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(-obs.width / 2 - 3, -obs.height / 2 + 5, obs.width + 6, obs.height + 4);

          // Car Body
          ctx.fillStyle = carColor;
          ctx.beginPath();
          ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 8);
          ctx.fill();

          // Windshield & Rear window
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-obs.width * 0.38, -obs.height * 0.35, obs.width * 0.76, obs.height * 0.22);
          ctx.fillRect(-obs.width * 0.38, obs.height * 0.15, obs.width * 0.76, obs.height * 0.18);

          // Headlights (facing downwards)
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-obs.width * 0.45, obs.height * 0.4, 8, 4);
          ctx.fillRect(obs.width * 0.45 - 8, obs.height * 0.4, 8, 4);

          // Taillights
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-obs.width * 0.45, -obs.height * 0.48, 8, 4);
          ctx.fillRect(obs.width * 0.45 - 8, -obs.height * 0.48, 8, 4);
        }

        ctx.restore();
      });

      // G. Draw Player Car
      ctx.save();
      ctx.translate(carPixelX, carPixelY);
      ctx.rotate((s.carAngle * Math.PI) / 180);

      // Flickering opacity if invincible after hit
      if (s.invincibleTimer > 0 && Math.floor(time / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      // Exhaust Boost Flames
      if (isBoosting || hasNitroPower || s.isFeverActive) {
        ctx.fillStyle = hasNitroPower || s.isFeverActive ? '#38bdf8' : '#f97316';
        const flameLength = 20 + Math.sin(time * 0.05) * 10;
        // Left exhaust flame
        ctx.beginPath();
        ctx.moveTo(-carW * 0.32, carH * 0.48);
        ctx.lineTo(-carW * 0.22, carH * 0.48);
        ctx.lineTo(-carW * 0.27, carH * 0.48 + flameLength);
        ctx.fill();

        // Right exhaust flame
        ctx.beginPath();
        ctx.moveTo(carW * 0.22, carH * 0.48);
        ctx.lineTo(carW * 0.32, carH * 0.48);
        ctx.lineTo(carW * 0.27, carH * 0.48 + flameLength);
        ctx.fill();
      }

      // Car Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.roundRect(-carW / 2 - 4, -carH / 2 + 6, carW + 8, carH + 6, 10);
      ctx.fill();

      // Car Main Body Chassis
      ctx.fillStyle = vehicle.color;
      ctx.beginPath();
      ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 10);
      ctx.fill();

      // Racing Stripes / Accent Trim
      ctx.fillStyle = vehicle.accentColor;
      ctx.fillRect(-4, -carH / 2, 8, carH);

      // Front Hood Cookie Emblem
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, -carH * 0.28, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(-2, -carH * 0.28 - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(2, -carH * 0.28 + 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Front Windshield
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-carW * 0.38, -carH * 0.15, carW * 0.76, carH * 0.26, 4);
      ctx.fill();

      // Windshield Sun Glare
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-carW * 0.25, -carH * 0.1);
      ctx.lineTo(carW * 0.2, carH * 0.05);
      ctx.stroke();

      // Rear Spoiler / Roof
      ctx.fillStyle = vehicle.accentColor;
      ctx.fillRect(-carW * 0.4, carH * 0.38, carW * 0.8, 6);

      // Bright Forward Headlight Beams
      const beamGrad = ctx.createLinearGradient(0, -carH / 2, 0, -carH / 2 - 120);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-carW * 0.4, -carH / 2);
      ctx.lineTo(-carW * 0.9, -carH / 2 - 120);
      ctx.lineTo(carW * 0.9, -carH / 2 - 120);
      ctx.lineTo(carW * 0.4, -carH / 2);
      ctx.fill();

      // Shield Bubble Aura
      if (hasShield) {
        ctx.strokeStyle = s.isFeverActive ? '#f43f5e' : '#38bdf8';
        ctx.shadowColor = s.isFeverActive ? '#f43f5e' : '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, carH * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = s.isFeverActive ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
      }

      ctx.restore();

      // H. Magnet Line Connections
      if (hasMagnet) {
        s.cookies.forEach((c) => {
          if (c.isMagnetized) {
            const cookiePixelX = roadLeft + c.x * roadWidth;
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(carPixelX, carPixelY - 20);
            ctx.lineTo(cookiePixelX, c.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // I. Render Particles & Floating Numbers
      s.particles.forEach((p) => {
        ctx.save();
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;

        if (p.shape === 'text' && p.text) {
          ctx.font = `bold ${p.size}px Fredoka, Outfit, sans-serif`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.textAlign = 'center';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // J. Fever Rainbow Screen Border
      if (s.isFeverActive) {
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, W - 8, H - 8);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [effectiveStats, isPaused, isTouchBraking, isTouchBoosting, onGameOver, onMissionProgress, onStatsUpdate, spawnCookieCluster, spawnObstacle, touchSteerDirection, vehicle]);

  // Handle Resize for Retina and Full Dynamic Canvas Fit
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-amber-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};
