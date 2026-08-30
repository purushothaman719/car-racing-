import { Vehicle, VehicleUpgrades } from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'cookie-cruiser',
    name: 'Cookie Cruiser',
    tagline: 'The Sweet Classic',
    description: 'A dependable roadster built with vanilla chrome and chocolate-chip hubcaps.',
    price: 0,
    unlocked: true,
    color: '#e11d48', // Crimson Red
    accentColor: '#fef08a', // Butter Cream
    glowColor: 'rgba(225, 29, 72, 0.5)',
    topSpeed: 130,
    acceleration: 3,
    handling: 3.5,
    magnetRangeBonus: 0,
    shieldDurability: 3,
    cookieMultiplierBonus: 1.0,
    style: 'classic',
  },
  {
    id: 'choco-roadster',
    name: 'Choco Roadster',
    tagline: 'Pure Cocoa Speed',
    description: 'Aerodynamic carbon-chocolate chassis tuned for high-velocity highway weaving.',
    price: 150,
    unlocked: false,
    color: '#78350f', // Dark Chocolate
    accentColor: '#fbbf24', // Amber Gold
    glowColor: 'rgba(251, 191, 36, 0.6)',
    topSpeed: 165,
    acceleration: 4,
    handling: 4,
    magnetRangeBonus: 20,
    shieldDurability: 3,
    cookieMultiplierBonus: 1.2,
    style: 'sport',
  },
  {
    id: 'donut-drifter',
    name: 'Donut Drifter',
    tagline: 'Frosted Glaze Agility',
    description: 'Sprinkled with sugar-grip tires for lightning-fast lane changes and smooth dodging.',
    price: 350,
    unlocked: false,
    color: '#ec4899', // Strawberry Pink
    accentColor: '#67e8f9', // Cyan Sprinkles
    glowColor: 'rgba(236, 72, 153, 0.6)',
    topSpeed: 150,
    acceleration: 4.5,
    handling: 5,
    magnetRangeBonus: 35,
    shieldDurability: 3,
    cookieMultiplierBonus: 1.3,
    style: 'kart',
  },
  {
    id: 'milk-tanker',
    name: 'Milk Tanker Heavy',
    tagline: 'Unstoppable Sweet Fortress',
    description: 'Heavy duty dairy delivery truck that plows through obstacles with magnetic suction.',
    price: 600,
    unlocked: false,
    color: '#0284c7', // Ice Blue
    accentColor: '#ffffff', // Pure Milk White
    glowColor: 'rgba(56, 189, 248, 0.6)',
    topSpeed: 125,
    acceleration: 2.5,
    handling: 2.5,
    magnetRangeBonus: 80,
    shieldDurability: 5,
    cookieMultiplierBonus: 1.4,
    style: 'truck',
  },
  {
    id: 'rainbow-hypercar',
    name: 'Rainbow Sugar Hypercar',
    tagline: 'Hypersonic Sugar Rush',
    description: 'State of the art hyper-confectionery engineering. Reaches blinding top speeds!',
    price: 1200,
    unlocked: false,
    color: '#8b5cf6', // Electric Purple
    accentColor: '#34d399', // Emerald Mint
    glowColor: 'rgba(168, 85, 247, 0.7)',
    topSpeed: 210,
    acceleration: 5,
    handling: 4.5,
    magnetRangeBonus: 50,
    shieldDurability: 4,
    cookieMultiplierBonus: 1.75,
    style: 'hyper',
  },
  {
    id: 'ginger-rocket',
    name: 'Gingerbread Jet Rocket',
    tagline: 'Legendary Royal Oven Tech',
    description: 'Infused with royal icing rocket boosters and cosmic sugar crystal propulsion.',
    price: 2500,
    unlocked: false,
    color: '#d97706', // Spiced Ginger Amber
    accentColor: '#ef4444', // Candy Cane Red
    glowColor: 'rgba(245, 158, 11, 0.8)',
    topSpeed: 240,
    acceleration: 5,
    handling: 5,
    magnetRangeBonus: 100,
    shieldDurability: 5,
    cookieMultiplierBonus: 2.0,
    style: 'gingerbread',
  },
];

export const DEFAULT_UPGRADES: Record<string, VehicleUpgrades> = {
  'cookie-cruiser': { topSpeedLevel: 1, accelerationLevel: 1, handlingLevel: 1, magnetLevel: 1, cookieBonusLevel: 1 },
  'choco-roadster': { topSpeedLevel: 1, accelerationLevel: 1, handlingLevel: 1, magnetLevel: 1, cookieBonusLevel: 1 },
  'donut-drifter': { topSpeedLevel: 1, accelerationLevel: 1, handlingLevel: 1, magnetLevel: 1, cookieBonusLevel: 1 },
  'milk-tanker': { topSpeedLevel: 1, accelerationLevel: 1, handlingLevel: 1, magnetLevel: 1, cookieBonusLevel: 1 },
  'rainbow-hypercar': { topSpeedLevel: 1, accelerationLevel: 1, handlingLevel: 1, magnetLevel: 1, cookieBonusLevel: 1 },
  'ginger-rocket': { topSpeedLevel: 1, accelerationLevel: 1, handlingLevel: 1, magnetLevel: 1, cookieBonusLevel: 1 },
};

export const UPGRADE_COSTS = [50, 100, 200, 400, 800]; // for levels 2, 3, 4, 5, 6
