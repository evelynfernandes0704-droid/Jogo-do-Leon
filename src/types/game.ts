/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState =
  | 'TITLE'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'DEDICATION';

export type EnemyType =
  | 'goon'
  | 'drone'
  | 'rat'
  | 'bat'
  | 'pumpkin_bomb'
  | 'turret'
  | 'boss';

export type BossType =
  | 'scorpion'
  | 'rhino'
  | 'lizard'
  | 'sandman'
  | 'vulture'
  | 'electro'
  | 'doc_ock'
  | 'mysterio'
  | 'kraven'
  | 'venom'
  | 'green_goblin';

export interface BossConfig {
  type: BossType;
  name: string;
  title: string;
  maxHealth: number;
  color: string;
  accentColor: string;
  attackSpeed: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  areaName: string;
  theme: 'day' | 'sunset' | 'night' | 'sewer' | 'lab' | 'storm' | 'rooftop_sunset' | 'catedral';
  skyColor: string;
  buildingColor: string;
  groundColor: string;
  accentColor: string;
  length: number; // in pixels
  boss: BossConfig;
  description: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  isJumping: boolean;
  isSwinging: boolean;
  swingAnchorX: number;
  swingAnchorY: number;
  swingLength: number;
  swingAngle: number;
  swingAngularVel: number;
  isWallClinging: boolean;
  wallClingSide: 'left' | 'right' | null;
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  coins: number;
  invulnerableTime: number; // frames
  attackCooldown: number;
  webCooldown: number; // Cooldown after trapping an enemy (5 seconds = 300 frames)
  maxWebCooldown: number;
  isSymbiote: boolean; // Active Venom Symbiote black suit mode (unlocked Level 6+)
  symbioteTimer: number; // Remaining duration of symbiote mode (20s = 1200 frames)
  symbioteCooldown: number; // Cooldown before symbiote mode can be activated again (40s = 2400 frames)
  symbioteArm?: {
    active: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    targetEnemyId?: string;
    progress: number;
    pulling: boolean;
    timer: number;
  } | null;
  isPunching: boolean;
  isAirKicking?: boolean; // True when executing aerial Voadora (dropkick)
  punchTimer: number;
  animFrame: number;
  animTick: number;
  spiderSenseAlert: number; // frames to show spider sense tingling
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: EnemyType;
  bossType?: BossType;
  health: number;
  maxHealth: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  behaviorTimer: number;
  state: string;
  color?: string;
  attackCooldown: number;
  isDead: boolean;
  deathTimer: number;
  scoreValue: number;
  isTrapped?: boolean;
  trappedTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  fromPlayer: boolean;
  type: 'web' | 'acid' | 'lightning' | 'pumpkin' | 'feather' | 'claw' | 'bullet' | 'sand_ball';
  color: string;
  lifeTime: number;
}

export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'brick' | 'question' | 'pipe' | 'metal' | 'building' | 'spike';
  content?: 'coin' | 'multi_coin' | 'pizza' | 'spider_token' | 'life' | 'web_recharge' | 'empty';
  isHit?: boolean;
  bounceOffset?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'pizza' | 'spider_token' | 'life';
  collected: boolean;
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'square' | 'line' | 'star';
}

export interface Flagpole {
  x: number;
  y: number;
  height: number;
  isTriggered: boolean;
}
