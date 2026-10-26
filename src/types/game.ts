import * as THREE from 'three';

export type Language = 'hi' | 'en';

export type JungleTheme = 'day' | 'sunset' | 'night';

export type CharacterId = 'raj' | 'maya' | 'veer';

export interface CharacterSkin {
  id: CharacterId;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  cost: number;
  unlocked: boolean;
  colors: {
    shirt: number;
    pants: number;
    skin: number;
    hat?: number;
    accent: number;
  };
}

export type PowerUpType = 'magnet' | 'shield' | 'multiplier' | 'boost';

export interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
  duration: number;
}

export interface GameStats {
  score: number;
  coins: number;
  distance: number;
  highScore: number;
  totalCoins: number;
  multiplier: number;
}

export interface Upgrades {
  magnetLevel: number;
  shieldLevel: number;
  multiplierLevel: number;
  boostLevel: number;
}

export type ObstacleType = 'rock' | 'log' | 'totem' | 'high_gate';

export interface ObstacleItem {
  id: number;
  type: ObstacleType;
  lane: number; // -1, 0, 1
  z: number;
  mesh: THREE.Group | THREE.Mesh;
  hit: boolean;
  cleared?: boolean;
  canSlideUnder?: boolean;
  canJumpOver?: boolean;
}

export interface CoinItem {
  id: number;
  lane: number;
  z: number;
  y: number;
  mesh: THREE.Mesh;
  collected: boolean;
}

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  lane: number;
  z: number;
  mesh: THREE.Group;
  collected: boolean;
}

export type MissionType =
  | 'collect_coins'
  | 'survive_distance_single'
  | 'survive_distance_total'
  | 'score_single'
  | 'jump_obstacles'
  | 'slide_obstacles'
  | 'collect_powerups';

export interface DailyMission {
  id: string;
  type: MissionType;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  tier: 'bronze' | 'silver' | 'gold';
  icon: string;
}

export interface DailyMissionsState {
  date: string; // YYYY-MM-DD
  missions: DailyMission[];
  allClaimedBonus: boolean;
  allClaimedBonusAmount: number;
}

