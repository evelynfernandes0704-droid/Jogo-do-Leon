/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Player,
  Enemy,
  Block,
  Collectible,
  Projectile,
  Particle,
  Flagpole,
  LevelConfig,
  GameState,
  BossType,
} from '../types/game';
import { sound } from '../utils/audio';

export interface GameEngineState {
  player: Player;
  enemies: Enemy[];
  blocks: Block[];
  collectibles: Collectible[];
  projectiles: Projectile[];
  particles: Particle[];
  flagpole: Flagpole;
  cameraX: number;
  currentLevelIndex: number;
  levelConfig: LevelConfig;
  activeBoss: Enemy | null;
  levelTimer: number;
  isPaused: boolean;
  keys: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    shoot: boolean;
    swing: boolean;
    punch: boolean;
    symbiote: boolean;
  };
}

export class GameEngine {
  public state: GameEngineState;
  public onStateChange?: (newState: GameState) => void;
  public onScoreChange?: (score: number, coins: number, lives: number, health: number) => void;

  constructor(levelConfig: LevelConfig, currentLevelIndex: number, startingLives: number = 3, startingScore: number = 0) {
    this.state = this.createInitialState(levelConfig, currentLevelIndex, startingLives, startingScore);
  }

  private createInitialState(
    levelConfig: LevelConfig,
    currentLevelIndex: number,
    lives: number,
    score: number
  ): GameEngineState {
    const player: Player = {
      x: 60,
      y: 180,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      isGrounded: false,
      facing: 'right',
      isJumping: false,
      isSwinging: false,
      swingAnchorX: 0,
      swingAnchorY: 0,
      swingLength: 0,
      swingAngle: 0,
      swingAngularVel: 0,
      isWallClinging: false,
      wallClingSide: null,
      health: 4,
      maxHealth: 4,
      lives,
      score,
      coins: 0,
      invulnerableTime: 0,
      attackCooldown: 0,
      webCooldown: 0,
      maxWebCooldown: 300,
      isSymbiote: false,
      symbioteTimer: 0,
      symbioteCooldown: 0,
      symbioteArm: null,
      isPunching: false,
      punchTimer: 0,
      animFrame: 0,
      animTick: 0,
      spiderSenseAlert: 0,
    };

    const { blocks, collectibles, enemies, flagpole, boss } = this.generateLevel(levelConfig);

    return {
      player,
      enemies,
      blocks,
      collectibles,
      projectiles: [],
      particles: [],
      flagpole,
      cameraX: 0,
      currentLevelIndex,
      levelConfig,
      activeBoss: boss,
      levelTimer: 300, // 300 seconds limit
      isPaused: false,
      keys: {
        left: false,
        right: false,
        up: false,
        down: false,
        jump: false,
        shoot: false,
        swing: false,
        punch: false,
        symbiote: false,
      },
    };
  }

  // Procedural and structured level layout generation tailored to each of the 11 levels
  private generateLevel(level: LevelConfig) {
    const blocks: Block[] = [];
    const collectibles: Collectible[] = [];
    const enemies: Enemy[] = [];
    const length = level.length;
    const groundY = 224;

    // Ground segments with gaps that require jumping or web-swinging
    let curX = 0;
    while (curX < length - 400) {
      const segWidth = 350 + Math.floor(Math.sin(curX) * 150) + 200;
      // Main ground block
      blocks.push({
        x: curX,
        y: groundY,
        width: segWidth,
        height: 64,
        type: 'ground',
      });

      // Add high skyscrapers/buildings in the background for web-swinging and rooftop traversal
      if (curX > 100 && curX % 500 < 250) {
        const buildH = 130 + (curX % 3) * 30;
        blocks.push({
          x: curX + 40,
          y: groundY - buildH,
          width: 100,
          height: buildH,
          type: 'building',
        });
      }

      // Add classic Mario-style floating blocks (? Blocks and Bricks)
      // Positioned on the open street section with ample clearance (64px) so Spidey passes underneath
      const platformX = curX + 170;
      const platformY = groundY - 88;
      for (let b = 0; b < 4; b++) {
        const isQuestion = b === 1 || b === 3;
        blocks.push({
          x: platformX + b * 24,
          y: platformY,
          width: 24,
          height: 24,
          type: isQuestion ? 'question' : 'brick',
          content: isQuestion ? (b === 1 ? 'coin' : 'pizza') : 'empty',
        });
      }

      // High aerial blocks for web slinging / high jump rewards
      // Raised with 66px clearance so Spider-Man (height 48px) can comfortably walk underneath on the lower platform and jump to head-bonk it
      if (curX > 400 && curX % 600 < 300) {
        blocks.push({
          x: platformX + 40,
          y: platformY - 90,
          width: 24,
          height: 24,
          type: 'question',
          content: 'spider_token',
        });
      }

      // Subway pipes / ventilation vents
      if (curX > 200 && curX % 700 < 200) {
        blocks.push({
          x: curX + segWidth - 70,
          y: groundY - 36,
          width: 32,
          height: 36,
          type: 'pipe',
        });
      }

      // Collectibles scattered on the level
      for (let c = 0; c < 3; c++) {
        collectibles.push({
          id: `coin-${curX}-${c}`,
          x: curX + 80 + c * 30,
          y: groundY - 30,
          width: 16,
          height: 16,
          type: 'coin',
          collected: false,
          bobOffset: c * 0.5,
        });
      }

      // Regular enemy spawns along the street / rooftops
      if (curX > 250 && curX < length - 800) {
        const isFlying = curX % 600 > 300;
        const enemyType = isFlying ? (level.theme === 'sewer' ? 'bat' : 'drone') : (level.theme === 'sewer' ? 'rat' : 'goon');
        const enemyW = isFlying ? 28 : (enemyType === 'rat' ? 26 : 24);
        const enemyH = isFlying ? 18 : (enemyType === 'rat' ? 16 : 36);
        enemies.push({
          id: `enemy-${curX}`,
          x: curX + segWidth / 2,
          y: isFlying ? groundY - 80 : groundY - enemyH,
          vx: -1,
          vy: 0,
          width: enemyW,
          height: enemyH,
          type: enemyType,
          health: 1,
          maxHealth: 1,
          facing: 'left',
          isGrounded: !isFlying,
          behaviorTimer: 0,
          state: 'patrol',
          attackCooldown: 100,
          isDead: false,
          deathTimer: 0,
          scoreValue: 100,
        });
      }

      // Gap distance (chasm to swing across)
      const gap = 90 + Math.floor((curX % 3) * 20);
      curX += segWidth + gap;
    }

    // Boss Arena Ground
    const bossArenaX = length - 700;
    blocks.push({
      x: bossArenaX,
      y: groundY,
      width: 750,
      height: 64,
      type: 'ground',
    });

    // Elevated platforms in boss arena (raised to allow Spidey to pass underneath)
    blocks.push({
      x: bossArenaX + 150,
      y: groundY - 76,
      width: 80,
      height: 16,
      type: 'metal',
    });
    blocks.push({
      x: bossArenaX + 420,
      y: groundY - 76,
      width: 80,
      height: 16,
      type: 'metal',
    });

    // Spawn Boss entity
    const bossConfig = level.boss;
    const boss: Enemy = {
      id: `boss-${level.id}`,
      x: bossArenaX + 400,
      y: groundY - 52,
      vx: -1.2,
      vy: 0,
      width: 44,
      height: 48,
      type: 'boss',
      bossType: bossConfig.type,
      health: bossConfig.maxHealth,
      maxHealth: bossConfig.maxHealth,
      facing: 'left',
      isGrounded: true,
      behaviorTimer: 0,
      state: 'attack',
      attackCooldown: 60,
      isDead: false,
      deathTimer: 0,
      scoreValue: 2000,
    };
    enemies.push(boss);

    // Goal Flagpole at the very end
    const flagpole: Flagpole = {
      x: length - 120,
      y: groundY - 140,
      height: 140,
      isTriggered: false,
    };

    return { blocks, collectibles, enemies, flagpole, boss };
  }

  // Update Game Loop (called every frame ~60fps)
  public update(delta: number): GameState | null {
    if (this.state.isPaused) return null;

    const { player } = this.state;

    // Tick timers
    if (player.invulnerableTime > 0) player.invulnerableTime--;
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.webCooldown > 0) player.webCooldown--;
    if (player.spiderSenseAlert > 0) player.spiderSenseAlert--;
    if (player.punchTimer > 0) {
      player.punchTimer--;
      if (player.punchTimer <= 0) {
        player.isPunching = false;
      }
    }

    // Venom Symbiote Mode management (Level 6+)
    const isLevel6Plus = this.state.levelConfig.id >= 6;
    if (isLevel6Plus) {
      // Key input check (V key or mobile button)
      if (this.state.keys.symbiote && !player.isSymbiote && player.symbioteCooldown <= 0) {
        this.activateSymbioteMode();
      }

      // Symbiote active duration (20 seconds = 1200 frames)
      if (player.isSymbiote) {
        player.symbioteTimer--;
        if (player.symbioteTimer <= 0) {
          player.isSymbiote = false;
          player.symbioteCooldown = 2400; // 40 seconds cooldown
          sound.playSpiderSense();
          this.createPopScore(player.x, player.y - 14, 'TRAJE CLÁSSICO RESTAURADO');
          this.createDustParticles(player.x + player.width / 2, player.y + player.height / 2, '#38bdf8');
        }
      } else if (player.symbioteCooldown > 0) {
        // Symbiote cooldown (40 seconds = 2400 frames)
        player.symbioteCooldown--;
        if (player.symbioteCooldown === 0) {
          sound.playSpiderSense();
          this.createPopScore(player.x, player.y - 14, '★ SIMBIOSE PRONTA! ★');
        }
      }
    }

    // Symbiote Arm Tendril Grab visual timer
    if (player.symbioteArm && player.symbioteArm.active) {
      player.symbioteArm.timer--;
      player.symbioteArm.startX = player.facing === 'right' ? player.x + player.width : player.x;
      player.symbioteArm.startY = player.y + 18;
      if (player.symbioteArm.timer <= 0) {
        player.symbioteArm = null;
      }
    }

    // 1. Process Player Input & Physics
    this.updatePlayerMovement();

    // 2. Update Web Swinging Mechanics
    this.updateWebSwinging();

    // 3. Update Projectiles
    this.updateProjectiles();

    // 4. Update Enemies & Boss AI
    this.updateEnemies();

    // 5. Update Blocks & Question Block Bounces
    this.updateBlocks();

    // 6. Check Collectible Pickups
    this.updateCollectibles();

    // 7. Update Particles
    this.updateParticles();

    // 8. Update Camera to follow Spidey
    this.updateCamera();

    // 9. Check Level Clear (Flagpole / Boss Defeat)
    if (this.state.flagpole.isTriggered) {
      player.vx = 0;
      return 'LEVEL_CLEAR';
    }

    // 10. Check Player Death / Pit Fall
    if (player.y > 320 || player.health <= 0) {
      sound.playGameOver();
      player.lives--;
      if (player.lives <= 0) {
        return 'GAME_OVER';
      } else {
        // Respawn at last safe ground
        player.health = player.maxHealth;
        player.x = Math.max(60, this.state.cameraX + 50);
        player.y = 160;
        player.vx = 0;
        player.vy = 0;
        player.isSwinging = false;
        player.invulnerableTime = 120;
      }
    }

    if (this.onScoreChange) {
      this.onScoreChange(player.score, player.coins, player.lives, player.health);
    }

    return null;
  }

  // Update Player Horizontal, Vertical, and Jumping
  private updatePlayerMovement() {
    const { player, keys, blocks } = this.state;
    const accel = 0.5;
    const maxSpeed = 3.6;
    const friction = 0.82;
    const gravity = 0.45;
    const terminalVelocity = 9.0;

    if (!player.isSwinging) {
      // Horizontal Input
      if (keys.left) {
        player.vx -= accel;
        player.facing = 'left';
        player.animTick++;
      } else if (keys.right) {
        player.vx += accel;
        player.facing = 'right';
        player.animTick++;
      } else {
        player.vx *= friction;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
      }

      // Clamp speed
      player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

      // Animation frame cycle
      if (player.animTick > 6) {
        player.animFrame = (player.animFrame + 1) % 4;
        player.animTick = 0;
      }

      // Vertical Gravity
      player.vy += gravity;
      if (player.vy > terminalVelocity) player.vy = terminalVelocity;

      // Jump (Mario-style variable jump height)
      if (keys.jump && player.isGrounded && !player.isJumping) {
        player.vy = -8.8;
        player.isGrounded = false;
        player.isJumping = true;
        sound.playJump();
        this.createDustParticles(player.x + player.width / 2, player.y + player.height);
      }

      // Cut jump height if jump key released early
      if (!keys.jump && player.isJumping && player.vy < -3) {
        player.vy = -3;
      }

      // Wall Cling & Wall Jump
      player.isWallClinging = false;
      player.wallClingSide = null;

      // Apply horizontal position & check block collisions
      player.x += player.vx;
      this.resolveHorizontalCollisions();

      // Apply vertical position & check block collisions
      const prevY = player.y;
      player.y += player.vy;
      this.resolveVerticalCollisions(prevY);

      // Check for wall cling against high buildings
      if (!player.isGrounded && player.vy > 0) {
        for (const block of blocks) {
          if (block.type === 'building') {
            // Check right cling
            if (keys.right && player.x + player.width >= block.x && player.x + player.width <= block.x + 8 && player.y + player.height > block.y && player.y < block.y + block.height - 35) {
              player.isWallClinging = true;
              player.wallClingSide = 'right';
              player.vy = Math.min(player.vy, 1.2); // Slow wall slide
              if (keys.jump) {
                // Wall jump!
                player.vy = -8.2;
                player.vx = -4.5;
                player.facing = 'left';
                sound.playJump();
              }
              break;
            }
            // Check left cling
            if (keys.left && player.x <= block.x + block.width && player.x >= block.x + block.width - 8 && player.y + player.height > block.y && player.y < block.y + block.height - 35) {
              player.isWallClinging = true;
              player.wallClingSide = 'left';
              player.vy = Math.min(player.vy, 1.2);
              if (keys.jump) {
                player.vy = -8.2;
                player.vx = 4.5;
                player.facing = 'right';
                sound.playJump();
              }
              break;
            }
          }
        }
      }

      // Punch Melee Attack input
      if (keys.punch && !player.isPunching && player.punchTimer <= 0) {
        this.performPunch();
      }

      // Web Shoot input
      if (keys.shoot && player.attackCooldown <= 0) {
        this.shootWeb();
      }
    }
  }

  // Perform Melee Punch Attack
  private performPunch() {
    const { player, enemies } = this.state;
    player.isPunching = true;
    player.punchTimer = 14;
    sound.playPunch();

    // Hitbox extending in front of Spidey
    const punchX = player.facing === 'right' ? player.x + player.width : player.x - 24;
    const punchY = player.y + 10;
    const punchW = 26;
    const punchH = 28;

    for (const enemy of enemies) {
      if (!enemy.isDead &&
          punchX < enemy.x + enemy.width &&
          punchX + punchW > enemy.x &&
          punchY < enemy.y + enemy.height &&
          punchY + punchH > enemy.y) {

        const wasTrapped = !!enemy.isTrapped;
        const damage = (wasTrapped ? 2 : 1) + (player.isSymbiote ? 1 : 0);
        enemy.health -= damage;
        enemy.isTrapped = false; // Punch shatters the web!

        // Spark particles
        this.createDustParticles(punchX + punchW / 2, punchY + punchH / 2, player.isSymbiote ? '#a855f7' : '#facc15');
        if (wasTrapped) {
          this.createDustParticles(punchX + punchW / 2, punchY + punchH / 2, player.isSymbiote ? '#c084fc' : '#ffffff');
        }
        sound.playBossHit();

        // Knockback enemy away from punch
        enemy.x += player.facing === 'right' ? 16 : -16;

        if (enemy.health <= 0) {
          enemy.isDead = true;
          enemy.deathTimer = 25;
          const scoreGained = wasTrapped ? enemy.scoreValue * 2 : enemy.scoreValue;
          player.score += scoreGained;
          this.createPopScore(enemy.x, enemy.y, wasTrapped ? `COMBO! ${scoreGained}` : `${scoreGained}`);
          if (enemy.type === 'boss') {
            this.onBossDefeated();
          }
        } else {
          this.createPopScore(enemy.x, enemy.y - 10, wasTrapped ? 'COMBO!' : 'POW!');
        }
        break;
      }
    }

    // Punch can also trigger adjacent question blocks and break bricks!
    for (const b of this.state.blocks) {
      if ((b.type === 'question' || b.type === 'brick') &&
          punchX < b.x + b.width &&
          punchX + punchW > b.x &&
          punchY < b.y + b.height &&
          punchY + punchH > b.y) {
        if (b.type === 'question' && !b.isHit) {
          b.isHit = true;
          b.bounceOffset = -8;
          sound.playCoin();
          if (b.content === 'pizza') {
            this.spawnCollectible(b.x + 4, b.y - 20, 'pizza');
          } else if (b.content === 'spider_token') {
            this.spawnCollectible(b.x + 4, b.y - 20, 'spider_token');
          } else {
            player.coins++;
            player.score += 200;
            this.createPopScore(b.x, b.y - 12, '200');
          }
        } else if (b.type === 'brick') {
          b.bounceOffset = -4;
          player.score += 50;
          sound.playStomp();
          this.createDustParticles(b.x + b.width / 2, b.y + b.height / 2, '#ef4444');
        }
      }
    }
  }

  // Web-Slinging and pendulum swing mechanics
  private updateWebSwinging() {
    const { player, keys, blocks } = this.state;

    // Trigger swing if swing key pressed and not already swinging
    if (keys.swing && !player.isSwinging) {
      // Find suitable anchor point above and slightly ahead
      const searchRadius = 220;
      let bestAnchor: { x: number; y: number } | null = null;
      let minDistance = searchRadius;

      const targetX = player.facing === 'right' ? player.x + 90 : player.x - 90;

      // Look for buildings or ceilings above
      for (const block of blocks) {
        if (block.type === 'building' || block.type === 'metal') {
          // Check top corners
          const points = [
            { x: block.x, y: block.y },
            { x: block.x + block.width / 2, y: block.y },
            { x: block.x + block.width, y: block.y },
          ];
          for (const pt of points) {
            const dist = Math.hypot(pt.x - player.x, pt.y - player.y);
            if (pt.y < player.y - 40 && dist < minDistance) {
              minDistance = dist;
              bestAnchor = pt;
            }
          }
        }
      }

      // Default high aerial anchor (clouds/distant crane) if no building is close
      if (!bestAnchor && player.y > 50) {
        bestAnchor = {
          x: targetX,
          y: Math.max(10, player.y - 140),
        };
      }

      if (bestAnchor) {
        player.isSwinging = true;
        player.swingAnchorX = bestAnchor.x;
        player.swingAnchorY = bestAnchor.y;

        // Find floor level underneath anchor to ensure swing arc never penetrates the ground
        let floorUnderAnchor = 224;
        for (const b of blocks) {
          if (b.type === 'ground' && bestAnchor.x >= b.x && bestAnchor.x <= b.x + b.width) {
            floorUnderAnchor = b.y;
            break;
          }
        }

        const rawLength = Math.hypot(player.x - bestAnchor.x, player.y - bestAnchor.y);
        const maxAllowedLength = Math.max(50, (floorUnderAnchor - player.height - 4) - bestAnchor.y);
        player.swingLength = Math.max(60, Math.min(rawLength, maxAllowedLength));
        player.swingAngle = Math.atan2(player.x - bestAnchor.x, player.y - bestAnchor.y);
        player.swingAngularVel = (player.vx / player.swingLength) * 1.5;
        sound.playSwingWeb();
      }
    }

    // Pendulum physics while swinging
    if (player.isSwinging) {
      const gravity = 0.0035;
      // Angular acceleration: - (g / L) * sin(angle)
      const angularAccel = -(gravity) * Math.sin(player.swingAngle);
      player.swingAngularVel += angularAccel;

      // Player pumping swing left or right
      if (keys.left) {
        player.swingAngularVel -= 0.002;
        player.facing = 'left';
      } else if (keys.right) {
        player.swingAngularVel += 0.002;
        player.facing = 'right';
      }

      // Damping
      player.swingAngularVel *= 0.992;
      player.swingAngle += player.swingAngularVel;

      // Calculate candidate position from angle
      const newX = player.swingAnchorX + Math.sin(player.swingAngle) * player.swingLength;
      const newY = player.swingAnchorY + Math.cos(player.swingAngle) * player.swingLength;

      // Solid floor collision check while swinging: Spidey must NEVER pass through the ground
      let solidFloorY = 224;
      for (const b of blocks) {
        if ((b.type === 'ground' || b.type === 'pipe' || b.type === 'metal') &&
            newX + player.width > b.x && newX < b.x + b.width) {
          solidFloorY = Math.min(solidFloorY, b.y);
        }
      }

      // If feet reach the ground level, land safely on feet and cleanly release the web
      if (newY + player.height >= solidFloorY) {
        player.x = newX;
        player.y = solidFloorY - player.height;
        const tangentialSpeed = player.swingAngularVel * player.swingLength;
        player.vx = Math.cos(player.swingAngle) * tangentialSpeed * 1.3;
        player.vy = 0;
        player.isGrounded = true;
        player.isJumping = false;
        player.isSwinging = false;
        sound.playJump();
      } else {
        player.x = newX;
        player.y = newY;
      }

      // Release web swing on key release or jump key
      if (!keys.swing || keys.jump) {
        player.isSwinging = false;
        // Calculate tangential release velocity with added boost
        const tangentialSpeed = player.swingAngularVel * player.swingLength;
        player.vx = Math.cos(player.swingAngle) * tangentialSpeed * 1.6;
        player.vy = Math.min(1.0, -Math.sin(player.swingAngle) * tangentialSpeed * 1.6 - 3.5);
        player.isGrounded = false;
        player.isJumping = true;

        // Ensure Spidey is strictly on or above the ground surface upon release
        for (const b of blocks) {
          if (b.type === 'ground' && player.x + player.width > b.x && player.x < b.x + b.width) {
            if (player.y + player.height > b.y) {
              player.y = b.y - player.height;
              player.isGrounded = true;
              player.isJumping = false;
              player.vy = 0;
            }
          }
        }
        sound.playJump();
      }
    }
  }

  // Activate Venom Symbiote Mode (Unlocked Level 6+)
  public activateSymbioteMode(): boolean {
    const { player, levelConfig } = this.state;
    if (levelConfig.id < 6) return false;
    if (player.isSymbiote || player.symbioteCooldown > 0) return false;

    player.isSymbiote = true;
    player.symbioteTimer = 1200; // 20 seconds at 60fps
    player.symbioteCooldown = 2400; // 40 seconds cycle
    sound.playSymbioteTransform();

    for (let i = 0; i < 20; i++) {
      this.createDustParticles(player.x + player.width / 2, player.y + player.height / 2, '#09090b');
      this.createDustParticles(player.x + player.width / 2, player.y + player.height / 2, '#a855f7');
    }
    this.createPopScore(player.x, player.y - 16, '★ MODO VENOM ATIVADO! ★');
    return true;
  }

  // Symbiote Tendril Grab Attack ("esticar o braço com a simbiose, agarrar o vilão e trazer pra perto para poder socar")
  private performSymbioteGrab() {
    const { player, enemies } = this.state;
    player.attackCooldown = 28;

    const maxReach = 280;
    const isFacingRight = player.facing === 'right';
    const startX = isFacingRight ? player.x + player.width : player.x;
    const startY = player.y + 18;

    // Search for the closest alive enemy ahead in reach
    let candidate: Enemy | null = null;
    let minDistance = maxReach;

    for (const e of enemies) {
      if (e.isDead) continue;
      const dx = isFacingRight ? e.x - player.x : player.x - e.x;
      // Enemy must be in front of Spider-Man and within reach
      if (dx > 0 && dx < maxReach && Math.abs((e.y + e.height / 2) - (player.y + player.height / 2)) < 90) {
        if (dx < minDistance) {
          minDistance = dx;
          candidate = e;
        }
      }
    }

    if (candidate) {
      const targetEnemy = candidate;
      const targetX = isFacingRight ? player.x + player.width + 12 : player.x - targetEnemy.width - 12;

      // Trap the villain in symbiotic tendrils
      targetEnemy.isTrapped = true;
      targetEnemy.trappedTimer = 180;

      // Reel them in right in front of Spider-Man for punching!
      targetEnemy.x = targetX;
      targetEnemy.y = 224 - targetEnemy.height;
      targetEnemy.vx = 0;
      targetEnemy.vy = 0;

      player.symbioteArm = {
        active: true,
        startX,
        startY,
        endX: targetEnemy.x + targetEnemy.width / 2,
        endY: targetEnemy.y + targetEnemy.height / 2,
        targetEnemyId: targetEnemy.id,
        progress: 1,
        pulling: true,
        timer: 16,
      };

      sound.playSymbioteTendril();
      this.createPopScore(targetEnemy.x, targetEnemy.y - 12, 'AGARRADO PELA SIMBIOSE!');
      this.createDustParticles(targetEnemy.x + targetEnemy.width / 2, targetEnemy.y + targetEnemy.height / 2, '#a855f7');
      this.createDustParticles(startX, startY, '#09090b');
    } else {
      // Symbiote arm whips out forward and snaps back
      const reachX = isFacingRight ? player.x + 220 : player.x - 220;
      player.symbioteArm = {
        active: true,
        startX,
        startY,
        endX: reachX,
        endY: startY,
        progress: 1,
        pulling: false,
        timer: 10,
      };
      sound.playSymbioteTendril();
      this.createDustParticles(reachX, startY, '#a855f7');
    }
  }

  // Fire Web Shot projectile (or Symbiote Grab in Venom Mode)
  private shootWeb() {
    const { player } = this.state;

    // In Venom Mode, Web power becomes the Symbiote Arm Tendril Grab!
    if (player.isSymbiote) {
      this.performSymbioteGrab();
      return;
    }

    // Regular Web Shot: check web cooldown (5 seconds after trapping an enemy)
    if (player.webCooldown > 0) return;

    player.attackCooldown = 22; // frames
    const speed = player.facing === 'right' ? 7.5 : -7.5;
    this.state.projectiles.push({
      id: `web-${Date.now()}-${Math.random()}`,
      x: player.facing === 'right' ? player.x + player.width + 4 : player.x - 14,
      y: player.y + 16,
      vx: speed,
      vy: 0,
      width: 14,
      height: 14,
      fromPlayer: true,
      type: 'web',
      color: '#ffffff',
      lifeTime: 70,
    });
    sound.playShootWeb();
  }

  // Resolve Horizontal Collisions with Blocks
  private resolveHorizontalCollisions() {
    const { player, blocks } = this.state;
    for (const b of blocks) {
      // Only solid foreground obstacles (bricks, question blocks, pipes) stop horizontal movement
      // Buildings are urban background facades that never block the street sidewalk
      if (b.type === 'brick' || b.type === 'question' || b.type === 'pipe') {
        const playerTop = player.y;
        const playerBottom = player.y + player.height;
        const blockTop = b.y;
        const blockBottom = b.y + b.height;

        // Ensure vertical overlap is substantially inside the block body (at least 6px)
        // This ensures the player NEVER trips or gets stuck on seams between adjacent blocks in a row!
        if (
          player.x < b.x + b.width &&
          player.x + player.width > b.x &&
          playerBottom > blockTop + 6 &&
          playerTop < blockBottom - 6
        ) {
          if (player.vx > 0) {
            player.x = b.x - player.width;
          } else if (player.vx < 0) {
            player.x = b.x + b.width;
          }
          player.vx = 0;
        }
      }
    }
  }

  // Resolve Vertical Collisions with Blocks (Floor landing & Question Block Bumping)
  private resolveVerticalCollisions(prevY: number) {
    const { player, blocks } = this.state;
    player.isGrounded = false;

    // Check Spike Hazards
    for (const b of blocks) {
      if (b.type === 'spike') {
        if (
          player.x < b.x + b.width &&
          player.x + player.width > b.x &&
          player.y + player.height >= b.y &&
          player.y < b.y + b.height
        ) {
          this.damagePlayer(1);
          player.vy = -6;
        }
      }
    }

    if (player.vy < 0) {
      // 1. MOVING UPWARDS: Check for ceiling bonk / hitting blocks from below
      // Find candidate blocks that the player's head hit from underneath
      const candidates: Block[] = [];
      for (const b of blocks) {
        if (b.type === 'brick' || b.type === 'question') {
          // Check horizontal overlap
          if (player.x < b.x + b.width && player.x + player.width > b.x) {
            // Check if player's head penetrated the bottom of the block
            if (player.y < b.y + b.height && prevY >= b.y && player.y + player.height > b.y + b.height) {
              candidates.push(b);
            }
          }
        }
      }

      if (candidates.length > 0) {
        // Pick the block whose horizontal center is closest to player's center
        const playerCenterX = player.x + player.width / 2;
        candidates.sort((a, b) => {
          const distA = Math.abs((a.x + a.width / 2) - playerCenterX);
          const distB = Math.abs((b.x + b.width / 2) - playerCenterX);
          return distA - distB;
        });

        const targetBlock = candidates[0];
        player.y = targetBlock.y + targetBlock.height;
        player.vy = 1.0; // Gentle bounce back down, Mario style

        if (targetBlock.type === 'question' && !targetBlock.isHit) {
          targetBlock.isHit = true;
          targetBlock.bounceOffset = -8;
          sound.playCoin();
          if (targetBlock.content === 'pizza') {
            this.spawnCollectible(targetBlock.x + 4, targetBlock.y - 20, 'pizza');
          } else if (targetBlock.content === 'spider_token') {
            this.spawnCollectible(targetBlock.x + 4, targetBlock.y - 20, 'spider_token');
          } else {
            player.coins++;
            player.score += 200;
            this.createPopScore(targetBlock.x, targetBlock.y - 12, '200');
          }
        } else if (targetBlock.type === 'brick') {
          targetBlock.bounceOffset = -4;
          player.score += 50;
          sound.playStomp();
          this.createDustParticles(targetBlock.x + targetBlock.width / 2, targetBlock.y + targetBlock.height, '#ef4444');
        }
      }
    } else {
      // 2. MOVING DOWNWARDS OR STANDING: Check landing on top of platforms/ground
      for (const b of blocks) {
        if (b.type === 'spike') continue;

        if (player.x < b.x + b.width && player.x + player.width > b.x) {
          if (b.type === 'ground') {
            // Ground blocks are strictly floors
            if (player.y + player.height >= b.y && prevY + player.height <= b.y + 16) {
              player.y = b.y - player.height;
              player.vy = 0;
              player.isGrounded = true;
              player.isJumping = false;
            }
          } else if (b.type === 'building') {
            // Landing on rooftop only
            if (player.y + player.height >= b.y && player.y + player.height <= b.y + 16 && prevY + player.height <= b.y + 12) {
              player.y = b.y - player.height;
              player.vy = 0;
              player.isGrounded = true;
              player.isJumping = false;
            }
          } else if (b.type === 'brick' || b.type === 'question' || b.type === 'pipe' || b.type === 'metal') {
            // Landing on top of brick, question block, pipe, or metal platform
            if (player.y + player.height >= b.y && prevY + player.height <= b.y + 14) {
              player.y = b.y - player.height;
              player.vy = 0;
              player.isGrounded = true;
              player.isJumping = false;
            }
          }
        }
      }
    }
  }

  // Update Projectiles (Webs, pumpkin bombs, acid, etc.)
  private updateProjectiles() {
    const { projectiles, blocks, enemies, player } = this.state;

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.lifeTime--;

      let remove = p.lifeTime <= 0;

      // Projectile hitting blocks
      if (!remove) {
        for (const b of blocks) {
          if (b.type !== 'spike' && p.x > b.x && p.x < b.x + b.width && p.y > b.y && p.y < b.y + b.height) {
            remove = true;
            this.createDustParticles(p.x, p.y, p.color);
            break;
          }
        }
      }

      // Player Web hitting Enemy or Boss
      if (!remove && p.fromPlayer) {
        for (const enemy of enemies) {
          if (!enemy.isDead && p.x < enemy.x + enemy.width && p.x + p.width > enemy.x && p.y < enemy.y + enemy.height && p.y + p.height > enemy.y) {
            remove = true;
            this.createDustParticles(p.x, p.y, '#ffffff');

            // Web entrapment! Traps enemy temporarily in sticky spider-webs
            enemy.isTrapped = true;
            enemy.trappedTimer = enemy.type === 'boss' ? 80 : 180; // ~3s for regular enemies, ~1.3s for bosses
            // 5 second cooldown when shooting web and trapping a villain!
            player.webCooldown = 300; // 5.0s at 60fps
            sound.playWebTrap();
            player.score += 50;
            this.createPopScore(enemy.x, enemy.y - 8, 'PRESO NA TEIA!');

            enemy.health--;

            if (enemy.health <= 0) {
              enemy.isDead = true;
              enemy.deathTimer = 25;
              player.score += enemy.scoreValue;
              this.createPopScore(enemy.x, enemy.y, `${enemy.scoreValue}`);
              if (enemy.type === 'boss') {
                sound.playBossHit();
                this.onBossDefeated();
              } else {
                sound.playStomp();
              }
            } else {
              sound.playBossHit();
              // Spider sense tingling feedback
              player.spiderSenseAlert = 15;
            }
            break;
          }
        }
      }

      // Enemy projectile hitting Player
      if (!remove && !p.fromPlayer) {
        if (
          p.x < player.x + player.width &&
          p.x + p.width > player.x &&
          p.y < player.y + player.height &&
          p.y + p.height > player.y
        ) {
          remove = true;
          this.damagePlayer(1);
        }
      }

      if (remove) {
        projectiles.splice(i, 1);
      }
    }
  }

  // Update Enemies and Boss AI
  private updateEnemies() {
    const { enemies, player, blocks } = this.state;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];

      if (enemy.isDead) {
        enemy.deathTimer--;
        if (enemy.deathTimer <= 0) {
          enemies.splice(i, 1);
        }
        continue;
      }

      // Keep ground enemies firmly on top of ground sidewalk so feet never penetrate
      if (enemy.type !== 'drone' && enemy.type !== 'bat') {
        enemy.y = 224 - enemy.height;
        enemy.vy = 0;
      }

      // Distance check to player
      const distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (distToPlayer < 120 && player.spiderSenseAlert === 0 && Math.random() < 0.05) {
        player.spiderSenseAlert = 20;
        sound.playSpiderSense();
      }

      // Check trapped state: while trapped in web, enemy cannot move or execute attacks!
      if (enemy.isTrapped) {
        enemy.trappedTimer = (enemy.trappedTimer || 0) - 1;
        if (enemy.trappedTimer <= 0) {
          enemy.isTrapped = false;
        }
      } else if (enemy.type === 'boss') {
        this.updateBossAI(enemy);
      } else {
        // Regular enemy patrol & movement
        enemy.x += enemy.vx;
        if (enemy.type === 'drone' || enemy.type === 'bat') {
          // Sinusoidal floating
          enemy.y += Math.sin(Date.now() / 200 + enemy.x) * 0.8;
        } else {
          // Check ground ledge or wall to turn around
          let hasGroundAhead = false;
          const checkX = enemy.vx > 0 ? enemy.x + enemy.width + 4 : enemy.x - 4;
          for (const b of blocks) {
            if (b.type === 'ground' && checkX >= b.x && checkX <= b.x + b.width) {
              hasGroundAhead = true;
              break;
            }
          }
          if (!hasGroundAhead) {
            enemy.vx *= -1;
            enemy.facing = enemy.vx > 0 ? 'right' : 'left';
          }
        }
      }

      // Mario-style Stomp mechanic on top of enemy!
      if (
        player.vy > 0 &&
        player.y + player.height >= enemy.y &&
        player.y + player.height <= enemy.y + 16 &&
        player.x + player.width > enemy.x + 4 &&
        player.x < enemy.x + enemy.width - 4
      ) {
        // Spidey stomps enemy!
        player.vy = -6.8; // High bounce!
        const wasTrapped = !!enemy.isTrapped;
        enemy.health -= wasTrapped ? 2 : 1;
        enemy.isTrapped = false;
        sound.playStomp();
        this.createDustParticles(enemy.x + enemy.width / 2, enemy.y, '#ffffff');

        if (enemy.health <= 0) {
          enemy.isDead = true;
          enemy.deathTimer = 25;
          const points = wasTrapped ? enemy.scoreValue * 2 : enemy.scoreValue;
          player.score += points;
          this.createPopScore(enemy.x, enemy.y, wasTrapped ? `COMBO! ${points}` : `${points}`);
          if (enemy.type === 'boss') {
            sound.playBossHit();
            this.onBossDefeated();
          }
        }
      } else if (
        // Trapped enemies cannot harm player on contact!
        !enemy.isTrapped &&
        player.invulnerableTime <= 0 &&
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
      ) {
        this.damagePlayer(1);
      }
    }
  }

  // Boss AI Pattern Engine
  private updateBossAI(boss: Enemy) {
    const { player } = this.state;
    boss.behaviorTimer++;
    boss.facing = player.x < boss.x ? 'left' : 'right';

    switch (boss.bossType) {
      case 'scorpion':
        // Mac Gargan: Walks, stops, shoots acid stinger projectile
        if (boss.behaviorTimer % 140 === 0) {
          const acidDir = boss.facing === 'left' ? -4 : 4;
          this.state.projectiles.push({
            id: `acid-${Date.now()}`,
            x: boss.facing === 'left' ? boss.x - 6 : boss.x + boss.width + 6,
            y: boss.y + 8,
            vx: acidDir,
            vy: -1.5,
            width: 12,
            height: 12,
            fromPlayer: false,
            type: 'acid',
            color: '#84cc16',
            lifeTime: 80,
          });
        }
        boss.x += (player.x < boss.x ? -0.9 : 0.9);
        break;

      case 'rhino':
        // High speed charge!
        if (boss.behaviorTimer % 180 < 80) {
          boss.x += (boss.facing === 'left' ? -2.8 : 2.8);
        } else {
          boss.vx = 0; // Pauses to catch breath
        }
        break;

      case 'lizard':
        // Leaps into air and slashes
        if (boss.behaviorTimer % 90 === 0 && boss.isGrounded) {
          boss.vy = -7.5;
          boss.isGrounded = false;
        }
        boss.vy += 0.4;
        boss.y += boss.vy;
        if (boss.y > 172) {
          boss.y = 172;
          boss.vy = 0;
          boss.isGrounded = true;
        }
        boss.x += (player.x < boss.x ? -1.4 : 1.4);
        break;

      case 'sandman':
        // Flings sand balls
        if (boss.behaviorTimer % 120 === 0) {
          const dir = boss.facing === 'left' ? -4.5 : 4.5;
          this.state.projectiles.push({
            id: `sand-${Date.now()}`,
            x: boss.x + boss.width / 2,
            y: boss.y + 12,
            vx: dir,
            vy: 0,
            width: 14,
            height: 14,
            fromPlayer: false,
            type: 'sand_ball',
            color: '#d97706',
            lifeTime: 70,
          });
        }
        break;

      case 'vulture':
        // Swooping aerial trajectory
        boss.y = 100 + Math.sin(boss.behaviorTimer * 0.05) * 45;
        boss.x += (player.x < boss.x ? -1.8 : 1.8);
        break;

      case 'electro':
        // Teleports and shoots lightning
        if (boss.behaviorTimer % 100 === 0) {
          boss.x = player.x + (Math.random() > 0.5 ? 140 : -140);
          this.createDustParticles(boss.x, boss.y, '#38bdf8');
          // Lightning bolt
          this.state.projectiles.push({
            id: `lightning-${Date.now()}`,
            x: boss.x,
            y: boss.y + 16,
            vx: boss.facing === 'left' ? -5 : 5,
            vy: 0,
            width: 22,
            height: 8,
            fromPlayer: false,
            type: 'lightning',
            color: '#38bdf8',
            lifeTime: 60,
          });
        }
        break;

      case 'doc_ock':
        // Claws attack forward
        boss.x += (player.x < boss.x ? -0.8 : 0.8);
        if (boss.behaviorTimer % 110 === 0) {
          // Tentacle slam
          this.state.projectiles.push({
            id: `claw-${Date.now()}`,
            x: boss.facing === 'left' ? boss.x - 20 : boss.x + boss.width,
            y: boss.y + 20,
            vx: boss.facing === 'left' ? -3.5 : 3.5,
            vy: 0,
            width: 16,
            height: 16,
            fromPlayer: false,
            type: 'claw',
            color: '#94a3b8',
            lifeTime: 40,
          });
        }
        break;

      case 'green_goblin':
        // Flies on glider, drops explosive pumpkin bombs!
        boss.y = 90 + Math.sin(boss.behaviorTimer * 0.06) * 35;
        boss.x += Math.sin(boss.behaviorTimer * 0.03) * 3.2;
        if (boss.behaviorTimer % 80 === 0) {
          // Drop pumpkin bomb
          this.state.projectiles.push({
            id: `pumpkin-${Date.now()}`,
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height,
            vx: (player.x - boss.x) * 0.02,
            vy: 2.8,
            width: 16,
            height: 16,
            fromPlayer: false,
            type: 'pumpkin',
            color: '#ea580c',
            lifeTime: 90,
          });
        }
        break;

      default:
        // Basic pacing
        boss.x += (player.x < boss.x ? -1 : 1);
        break;
    }
  }

  // Trigger when Boss is defeated
  private onBossDefeated() {
    const { player, flagpole } = this.state;
    // Spawn celebratory fireworks & trigger flagpole
    for (let p = 0; p < 30; p++) {
      this.createDustParticles(flagpole.x + 8, flagpole.y + 30, '#facc15');
    }
    player.score += 5000;
  }

  // Damage player
  private damagePlayer(amount: number) {
    const { player } = this.state;
    if (player.invulnerableTime > 0) return;

    player.health -= amount;
    player.invulnerableTime = 70; // Invincibility frames
    player.vy = -4.5;
    player.vx = player.facing === 'right' ? -3 : 3;
    sound.playHurt();
    this.createDustParticles(player.x + player.width / 2, player.y + player.height / 2, '#dc2626');
  }

  // Collectibles update & Flagpole interaction
  private updateCollectibles() {
    const { player, collectibles, flagpole } = this.state;

    // Check Collectibles
    for (const c of collectibles) {
      if (!c.collected && Math.hypot(player.x + player.width / 2 - (c.x + 8), player.y + player.height / 2 - (c.y + 8)) < 24) {
        c.collected = true;
        if (c.type === 'coin') {
          player.coins++;
          player.score += 100;
          sound.playCoin();
          if (player.coins >= 50) {
            player.coins -= 50;
            player.lives++;
            sound.playPowerup();
            this.createPopScore(player.x, player.y - 10, '1-UP!');
          }
        } else if (c.type === 'pizza') {
          player.health = Math.min(player.maxHealth, player.health + 1);
          player.score += 500;
          sound.playPizza();
          this.createPopScore(player.x, player.y - 10, '+1 VIDA!');
        } else if (c.type === 'spider_token') {
          player.score += 1000;
          player.invulnerableTime = 200;
          sound.playPowerup();
          this.createPopScore(player.x, player.y - 10, 'PODER ARANHA!');
        }
      }
    }

    // Check Flagpole trigger (Mario-style slide down pole)
    // Rule: You can ONLY pass the level if you defeat all enemies OR collect all points!
    if (!flagpole.isTriggered && player.x >= flagpole.x - 14 && player.x <= flagpole.x + 30) {
      const { canPassLevel, aliveEnemies, remainingCollectibles } = this.getLevelObjectivesStatus();

      if (canPassLevel) {
        flagpole.isTriggered = true;
        sound.playLevelClear();
        player.score += 3000;
        this.createPopScore(flagpole.x, flagpole.y + 20, 'FASE CONCLUÍDA!');
      } else {
        // Block player from passing through
        if (player.x > flagpole.x - 12) {
          player.x = flagpole.x - 12;
          player.vx = 0;
        }
        if (Math.random() < 0.06) {
          sound.playSpiderSense();
          this.createPopScore(flagpole.x - 20, flagpole.y - 12, 'SAÍDA TRANCADA!');
          this.createPopScore(flagpole.x - 30, flagpole.y + 10, `${aliveEnemies} VILÕES OU ${remainingCollectibles} PONTOS RESTAM`);
        }
      }
    }
  }

  // Update animated bouncing blocks
  private updateBlocks() {
    for (const b of this.state.blocks) {
      if (b.bounceOffset && b.bounceOffset < 0) {
        b.bounceOffset += 1.5;
        if (b.bounceOffset >= 0) b.bounceOffset = 0;
      }
    }
  }

  // Smooth Camera following Spider-Man
  private updateCamera() {
    const { player, levelConfig } = this.state;
    const targetCameraX = player.x - 180;
    this.state.cameraX = Math.max(0, Math.min(levelConfig.length - 480, targetCameraX));
  }

  // Spawn dynamic collectible from Question Block
  private spawnCollectible(x: number, y: number, type: 'pizza' | 'spider_token') {
    this.state.collectibles.push({
      id: `spawn-${Date.now()}`,
      x,
      y,
      width: 16,
      height: 16,
      type,
      collected: false,
      bobOffset: 0,
    });
  }

  // Particles & Visual Feedback
  private updateParticles() {
    const { particles } = this.state;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = p.life / p.maxLife;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  private createDustParticles(x: number, y: number, color: string = '#cbd5e1') {
    for (let i = 0; i < 6; i++) {
      this.state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5 - 1,
        size: Math.random() * 3 + 2,
        color,
        alpha: 1,
        life: 20,
        maxLife: 20,
      });
    }
  }

  private createPopScore(x: number, y: number, text: string) {
    this.state.particles.push({
      x,
      y,
      vx: 0,
      vy: -1,
      size: 10,
      color: '#facc15',
      alpha: 1,
      life: 40,
      maxLife: 40,
      shape: 'star',
    });
  }

  // Get current level objectives status (Defeat all enemies OR collect all points)
  public getLevelObjectivesStatus() {
    const aliveEnemies = this.state.enemies.filter((e) => !e.isDead).length;
    const totalEnemies = this.state.enemies.length;
    const remainingCollectibles = this.state.collectibles.filter((c) => !c.collected).length;
    const totalCollectibles = this.state.collectibles.length;
    const canPassLevel = aliveEnemies === 0 || remainingCollectibles === 0;

    return {
      aliveEnemies,
      totalEnemies,
      remainingCollectibles,
      totalCollectibles,
      canPassLevel,
    };
  }
}
