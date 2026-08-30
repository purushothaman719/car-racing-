/**
 * Type definitions for Cookie Drive
 */

export type GameMode = 'ENDLESS' | 'TIME_ATTACK' | 'COOKIE_HUNT';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'GARAGE' | 'MISSIONS' | 'SETTINGS';

export type CookieType = 
  | 'CHOC_CHIP' 
  | 'DOUBLE_CHOC' 
  | 'GOLDEN' 
  | 'RAINBOW' 
  | 'FORTUNE' 
  | 'COOKIE_JAR'
  | 'MILK_CARTON';

export type ObstacleType = 
  | 'TRAFFIC_CAR' 
  | 'DELIVERY_VAN' 
  | 'OIL_SLICK' 
  | 'ROLLING_PIN' 
  | 'DONUT_BARRIER' 
  | 'CHOCOLATE_PUDDLE';

export type PowerUpType = 
  | 'MAGNET' 
  | 'SHIELD' 
  | 'FEVER' 
  | 'NITRO' 
  | 'SLOW_MO' 
  | 'DOUBLE_POINTS';

export interface Vehicle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  unlocked: boolean;
  color: string;
  accentColor: string;
  glowColor: string;
  topSpeed: number; // 80 - 220 km/h
  acceleration: number; // 1 - 5
  handling: number; // 1 - 5 (steering agility)
  magnetRangeBonus: number; // in pixels
  shieldDurability: number; // max hearts / shield hits
  cookieMultiplierBonus: number; // e.g. 1.0, 1.25, 1.5
  style: 'classic' | 'sport' | 'truck' | 'kart' | 'hyper' | 'gingerbread';
}

export interface VehicleUpgrades {
  topSpeedLevel: number;
  accelerationLevel: number;
  handlingLevel: number;
  magnetLevel: number;
  cookieBonusLevel: number;
}

export interface CookieEntity {
  id: number;
  x: number; // road relative X (0 to 1 across lanes)
  y: number; // road distance Y in world coords
  type: CookieType;
  points: number;
  cookieValue: number;
  radius: number;
  rotation: number;
  spinSpeed: number;
  isMagnetized?: boolean;
  scale?: number;
}

export interface ObstacleEntity {
  id: number;
  x: number; // 0 to 1
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  speed: number; // for moving traffic
  lane: number;
  targetLane?: number;
  color?: string;
  isHit?: boolean;
  driftAngle?: number;
}

export interface PowerUpEntity {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
  duration: number; // in seconds
  radius: number;
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape: 'circle' | 'crumb' | 'sparkle' | 'star' | 'smoke' | 'fire' | 'text';
  text?: string;
  alpha?: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
  duration: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardCookies: number;
  type: 'COLLECT_COOKIES' | 'COLLECT_GOLDEN' | 'SCORE_POINTS' | 'DRIVE_DISTANCE' | 'NEAR_MISSES' | 'ACTIVATE_FEVER';
  completed: boolean;
  claimed: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  cookiesCollectedThisRun: number;
  totalCookiesBank: number;
  distanceMeters: number;
  maxCombo: number;
  currentCombo: number;
  feverGauge: number; // 0 - 100
  isFeverActive: boolean;
  nearMissCount: number;
  obstaclesSmashed: number;
  speedKmh: number;
  currentLane: number;
  health: number;
  maxHealth: number;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  sfxMuted: boolean;
  musicMuted: boolean;
}
