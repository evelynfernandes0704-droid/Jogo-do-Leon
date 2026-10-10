/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Enemy, Block, Collectible, Projectile, BossType } from '../types/game';

// Draw retro 8-bit pixel art directly onto Canvas 2D context
export class SpriteRenderer {
  // Draw Spider-Man (Classic Red/Blue or Venom Symbiote Black Suit)
  static drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-player.width, 0);
    }

    // Damage blink
    if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const w = player.width;
    const h = player.height;
    const isSymbiote = !!player.isSymbiote;

    // Palette: Classic Red/Blue vs Venom Symbiote Black Suit
    const pal = isSymbiote
      ? {
          primary: '#09090b',    // Pitch black symbiote body
          secondary: '#020617',  // Deep dark suit sides
          accent: '#1e1b4b',     // Deep midnight highlight
          boots: '#09090b',
          gloves: '#09090b',
          belt: '#09090b',
          emblem: '#ffffff',     // Giant iconic white Venom spider emblem!
          eye: '#ffffff',
          eyeBorder: '#020617',
          whoosh: '#c084fc',     // Purple symbiotic punch trail
        }
      : {
          primary: '#dc2626',    // Classic vibrant red
          secondary: '#1d4ed8',  // Classic blue sides
          accent: '#b91c1c',
          boots: '#dc2626',
          gloves: '#dc2626',
          belt: '#dc2626',
          emblem: '#0f172a',     // Black spider emblem
          eye: '#ffffff',
          eyeBorder: '#0f172a',
          whoosh: '#fde047',
        };

    // Venom Symbiote Aura: dark bio-luminescent tendrils pulsing around player
    if (isSymbiote) {
      const t = Date.now() / 90;
      ctx.fillStyle = '#a855f7';
      for (let i = 0; i < 5; i++) {
        const tx = w / 2 + Math.sin(t + i * 1.3) * 16;
        const ty = h / 2 + Math.cos(t * 1.1 + i * 1.8) * 20;
        ctx.fillRect(tx, ty, 2, 2);
      }
      // Glowing purple foot sparks
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(w / 2 - 6, h - 2, 3, 2);
      ctx.fillRect(w / 2 + 4, h - 2, 3, 2);
    }

    // Spider-Sense tingling visual effect
    if (player.spiderSenseAlert > 0) {
      ctx.strokeStyle = isSymbiote ? '#c084fc' : '#facc15';
      ctx.lineWidth = 2;
      const t = Date.now() / 80;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 8, -6 + Math.sin(t) * 2);
      ctx.lineTo(w / 2 - 14, -14);
      ctx.moveTo(w / 2, -8);
      ctx.lineTo(w / 2, -18);
      ctx.moveTo(w / 2 + 8, -6 + Math.cos(t) * 2);
      ctx.lineTo(w / 2 + 14, -14);
      ctx.stroke();

      ctx.strokeStyle = isSymbiote ? '#ffffff' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 6, -4);
      ctx.lineTo(w / 2 - 10, -10);
      ctx.moveTo(w / 2 + 6, -4);
      ctx.lineTo(w / 2 + 10, -10);
      ctx.stroke();
    }

    // Poses
    if (player.isPunching) {
      if (!player.isGrounded || player.isAirKicking || player.isSwinging) {
        SpriteRenderer.drawSpideyDropkick(ctx, w, h, pal);
      } else {
        SpriteRenderer.drawSpideyPunch(ctx, w, h, pal);
      }
    } else if (player.isWallClinging) {
      this.drawSpideyCling(ctx, w, h, pal);
    } else if (player.isSwinging) {
      this.drawSpideySwing(ctx, w, h, pal);
    } else if (!player.isGrounded) {
      this.drawSpideyJump(ctx, w, h, player.vy, pal);
    } else if (Math.abs(player.vx) > 0.5) {
      this.drawSpideyRun(ctx, w, h, player.animFrame, pal);
    } else {
      this.drawSpideyIdle(ctx, w, h, pal);
    }

    ctx.restore();
  }

  // Draw Symbiote Extended Arm / Tendril Grapple
  static drawSymbioteArm(ctx: CanvasRenderingContext2D, player: Player) {
    if (!player.symbioteArm || !player.symbioteArm.active) return;
    const arm = player.symbioteArm;

    ctx.save();
    const sx = arm.startX;
    const sy = arm.startY;
    const ex = arm.endX;
    const ey = arm.endY;
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2 - 10;

    // Thick black symbiote tendril
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(midX, midY, ex, ey);
    ctx.stroke();

    // Dark purple core
    ctx.strokeStyle = '#7e22ce';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(midX, midY, ex, ey);
    ctx.stroke();

    // Bright purple bio-luminescent filament
    ctx.strokeStyle = '#d8b4fe';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(midX, midY, ex, ey);
    ctx.stroke();

    // Symbiote Claw / Maw grasping the target
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ex - 4, ey - 4, 8, 8);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(ex - 3, ey - 3, 6, 6);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(ex - 6, ey - 2, 4, 4);
    ctx.fillRect(ex + 2, ey - 2, 4, 4);
    ctx.fillRect(ex - 2, ey - 6, 4, 4);
    ctx.fillRect(ex - 2, ey + 2, 4, 4);

    ctx.restore();
  }

  // Spidey Punch Pose (Fist thrust forward with speed trail)
  private static drawSpideyPunch(ctx: CanvasRenderingContext2D, w: number, h: number, pal: any) {
    // Head (leaning forward)
    ctx.fillStyle = pal.primary;
    ctx.fillRect(8, 4, 16, 12);
    // Eye focused forward
    ctx.fillStyle = pal.eyeBorder;
    ctx.fillRect(17, 8, 7, 5);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(18, 9, 5, 3);

    // Torso (forward power stance)
    ctx.fillStyle = pal.primary;
    ctx.fillRect(8, 16, 12, 13);
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(4, 17, 4, 12);

    // Back arm pulled back
    ctx.fillStyle = pal.primary;
    ctx.fillRect(0, 18, 6, 6);

    // Forward punching arm & fist!
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(18, 16, 8, 6);
    ctx.fillStyle = pal.gloves;
    ctx.fillRect(26, 15, 10, 8);

    // Punch impact whoosh speed lines
    ctx.fillStyle = pal.whoosh;
    ctx.fillRect(36, 17, 5, 2);
    ctx.fillRect(36, 21, 7, 2);

    // Legs (sturdy martial stance)
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(3, 29, 7, 11);
    ctx.fillRect(14, 29, 8, 11);
    ctx.fillStyle = pal.boots;
    ctx.fillRect(2, 40, 8, 8);
    ctx.fillRect(16, 40, 8, 8);
  }

  // Spidey Idle Pose
  private static drawSpideyIdle(ctx: CanvasRenderingContext2D, w: number, h: number, pal: any) {
    // Head
    ctx.fillStyle = pal.primary;
    ctx.fillRect(6, 2, 16, 12);
    // Torso
    ctx.fillRect(8, 14, 12, 14);
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(4, 15, 4, 13);
    ctx.fillRect(20, 15, 4, 13);
    // Belt
    ctx.fillStyle = pal.belt;
    ctx.fillRect(7, 28, 14, 4);
    // Legs
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(7, 32, 6, 10);
    ctx.fillRect(15, 32, 6, 10);
    // Boots
    ctx.fillStyle = pal.boots;
    ctx.fillRect(6, 42, 7, 6);
    ctx.fillRect(15, 42, 7, 6);
    // Gloves
    ctx.fillStyle = pal.gloves;
    ctx.fillRect(3, 22, 5, 6);
    ctx.fillRect(20, 22, 5, 6);

    // Spider emblem on chest
    ctx.fillStyle = pal.emblem;
    ctx.fillRect(13, 18, 2, 6);
    ctx.fillRect(11, 19, 6, 2);
    ctx.fillRect(10, 21, 8, 1);

    // Expressive White Spidey / Venom Eyes
    ctx.fillStyle = pal.eyeBorder;
    ctx.fillRect(14, 6, 7, 5);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(15, 7, 5, 3);
  }

  // Spidey Run Animation
  private static drawSpideyRun(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, pal: any) {
    const f = frame % 4;
    // Head
    ctx.fillStyle = pal.primary;
    ctx.fillRect(8, 3, 16, 12);
    // Eyes
    ctx.fillStyle = pal.eyeBorder;
    ctx.fillRect(16, 7, 7, 5);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(17, 8, 5, 3);

    // Torso (leaning forward)
    ctx.fillStyle = pal.primary;
    ctx.fillRect(10, 15, 12, 13);
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(6, 16, 4, 12);
    ctx.fillRect(22, 16, 4, 12);

    // Chest spider
    ctx.fillStyle = pal.emblem;
    ctx.fillRect(15, 19, 2, 5);
    ctx.fillRect(13, 20, 6, 2);

    // Running legs cycle
    ctx.fillStyle = pal.secondary;
    if (f === 0 || f === 2) {
      // Stride wide
      ctx.fillRect(4, 30, 6, 10);
      ctx.fillRect(18, 30, 6, 10);
      ctx.fillStyle = pal.boots;
      ctx.fillRect(2, 40, 7, 7);
      ctx.fillRect(20, 40, 7, 7);
      // Arms swinging
      ctx.fillRect(2, 18, 5, 7);
      ctx.fillRect(21, 20, 5, 7);
    } else {
      // High knees
      ctx.fillRect(8, 28, 6, 10);
      ctx.fillRect(16, 32, 6, 8);
      ctx.fillStyle = pal.boots;
      ctx.fillRect(8, 38, 7, 8);
      ctx.fillRect(16, 40, 7, 7);
      // Arms swinging reverse
      ctx.fillRect(22, 17, 5, 7);
      ctx.fillRect(3, 21, 5, 7);
    }
  }

  // Spidey Jump Pose
  private static drawSpideyJump(ctx: CanvasRenderingContext2D, w: number, h: number, vy: number, pal: any) {
    // Dynamic acrobatic tuck
    ctx.fillStyle = pal.primary;
    ctx.fillRect(7, 2, 16, 12);
    // Eyes
    ctx.fillStyle = pal.eyeBorder;
    ctx.fillRect(15, 6, 7, 5);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(16, 7, 5, 3);

    // Torso
    ctx.fillStyle = pal.primary;
    ctx.fillRect(9, 14, 12, 12);
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(5, 15, 4, 11);
    ctx.fillRect(21, 15, 4, 11);

    // Spider emblem
    ctx.fillStyle = pal.emblem;
    ctx.fillRect(14, 18, 2, 5);

    // Tucked legs & reaching arms
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(5, 26, 7, 9);
    ctx.fillRect(16, 26, 7, 9);
    ctx.fillStyle = pal.boots;
    ctx.fillRect(3, 35, 8, 7);
    ctx.fillRect(17, 35, 8, 7);

    // Arms up
    ctx.fillStyle = pal.gloves;
    ctx.fillRect(2, 8, 5, 8);
    ctx.fillRect(21, 8, 5, 8);
  }

  // Spidey Web Swing Pose
  private static drawSpideySwing(ctx: CanvasRenderingContext2D, w: number, h: number, pal: any) {
    // Holding web line with arm stretched up
    ctx.fillStyle = pal.primary;
    ctx.fillRect(8, 6, 16, 12);
    // Eye looking forward
    ctx.fillStyle = pal.eyeBorder;
    ctx.fillRect(16, 10, 7, 5);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(17, 11, 5, 3);

    // Arm shooting up holding web
    ctx.fillStyle = pal.primary;
    ctx.fillRect(14, -6, 5, 12);
    ctx.fillRect(13, -10, 7, 5); // Hand clasping

    // Torso angled
    ctx.fillStyle = pal.primary;
    ctx.fillRect(9, 18, 12, 12);
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(5, 19, 4, 11);
    ctx.fillRect(21, 19, 4, 11);

    // Trailing acrobatic legs
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(4, 30, 8, 8);
    ctx.fillRect(16, 32, 8, 8);
    ctx.fillStyle = pal.boots;
    ctx.fillRect(2, 38, 7, 6);
    ctx.fillRect(18, 40, 7, 6);
  }

  // Spidey Wall-Cling Pose
  private static drawSpideyCling(ctx: CanvasRenderingContext2D, w: number, h: number, pal: any) {
    // Head facing wall
    ctx.fillStyle = pal.primary;
    ctx.fillRect(6, 6, 16, 12);
    ctx.fillStyle = pal.eyeBorder;
    ctx.fillRect(15, 9, 6, 4);
    ctx.fillStyle = pal.eye;
    ctx.fillRect(16, 10, 4, 3);

    // Torso pressed to wall
    ctx.fillStyle = pal.primary;
    ctx.fillRect(7, 18, 13, 12);
    ctx.fillStyle = pal.secondary;
    ctx.fillRect(4, 19, 3, 11);

    // Arms and legs sticking to wall (right side)
    ctx.fillStyle = pal.gloves;
    ctx.fillRect(20, 10, 8, 6);
    ctx.fillRect(20, 24, 8, 6);

    ctx.fillStyle = pal.secondary;
    ctx.fillRect(5, 30, 8, 6);
    ctx.fillStyle = pal.boots;
    ctx.fillRect(16, 33, 10, 6);
  }

  // Draw Enemies and Bosses
  static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-enemy.width, 0);
    }

    if (enemy.type === 'boss' && enemy.bossType) {
      this.drawBoss(ctx, enemy.bossType, enemy);
    } else {
      switch (enemy.type) {
        case 'goon':
          this.drawGoon(ctx, enemy);
          break;
        case 'drone':
          this.drawDrone(ctx, enemy);
          break;
        case 'rat':
          this.drawRat(ctx, enemy);
          break;
        case 'bat':
          this.drawBat(ctx, enemy);
          break;
        case 'pumpkin_bomb':
          this.drawPumpkinBomb(ctx, enemy);
          break;
        default:
          this.drawGoon(ctx, enemy);
      }
    }

    // Draw white spider-web cocoon if enemy is trapped!
    if (enemy.isTrapped) {
      this.drawWebCocoon(ctx, enemy.width, enemy.height);
    }

    ctx.restore();
  }

  // Spider-web Cocoon / Entrapment mesh over immobilized enemy
  private static drawWebCocoon(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    // Semi-translucent white web shroud
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Thick crisscross web lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Diagonal crisscross
    ctx.moveTo(2, 2);
    ctx.lineTo(w - 2, h - 2);
    ctx.moveTo(w - 2, 2);
    ctx.lineTo(2, h - 2);
    // Horizontal and vertical strands
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 4);
    ctx.lineTo(w, h / 4);
    ctx.moveTo(0, (3 * h) / 4);
    ctx.lineTo(w, (3 * h) / 4);
    ctx.stroke();

    // Web joints / knots
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(w / 2 - 2, h / 2 - 2, 4, 4);
    ctx.fillRect(w / 4, h / 4, 3, 3);
    ctx.fillRect((3 * w) / 4 - 3, (3 * h) / 4 - 3, 3, 3);
    ctx.fillRect(w / 4, (3 * h) / 4 - 3, 3, 3);
    ctx.fillRect((3 * w) / 4 - 3, h / 4, 3, 3);
    ctx.restore();
  }

  // Street Goon (Mario Goomba / Koopa equivalent)
  private static drawGoon(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    // Dark jacket, red beanie, bat - exactly 36px tall so boots touch ground perfectly
    // Beanie
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(5, 0, 14, 5);
    // Face
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(5, 5, 14, 7);
    // Mask/Sunglasses
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 7, 10, 3);

    // Leather Jacket
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4, 12, 16, 12);
    // Belt
    ctx.fillStyle = '#64748b';
    ctx.fillRect(4, 24, 16, 2);
    // Pants
    ctx.fillStyle = '#334155';
    ctx.fillRect(5, 26, 5, 6);
    ctx.fillRect(14, 26, 5, 6);
    // Boots resting flush on ground (y: 32..36)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 32, 6, 4);
    ctx.fillRect(14, 32, 6, 4);

    // Baseball bat
    ctx.fillStyle = '#b45309';
    ctx.fillRect(19, 8, 3, 16);
  }

  // Flying Drone (Oscorp security)
  private static drawDrone(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    const t = Date.now() / 60;
    // Metallic body
    ctx.fillStyle = '#475569';
    ctx.fillRect(4, 8, 24, 12);
    // Glowing red eye
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(18, 12, 6, 4);
    // Rotor blades spinning
    ctx.fillStyle = '#94a3b8';
    const bladeOffset = Math.sin(t * 3) * 4;
    ctx.fillRect(0 + bladeOffset, 4, 12, 2);
    ctx.fillRect(20 - bladeOffset, 4, 12, 2);
    // Blaster nozzle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, 16, 6, 3);
  }

  // Sewer Rat
  private static drawRat(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    // Grey body exactly 16px tall so feet rest flush on ground
    ctx.fillStyle = '#64748b';
    ctx.fillRect(4, 4, 16, 8);
    ctx.fillRect(20, 6, 5, 5); // Snout
    // Red glowing toxic eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(21, 7, 2, 2);
    // Pink tail
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(0, 7, 4, 2);
    ctx.fillRect(0, 4, 2, 3);
    // Feet resting flush on ground (y: 12..16)
    ctx.fillStyle = '#334155';
    ctx.fillRect(6, 12, 4, 4);
    ctx.fillRect(16, 12, 4, 4);
  }

  // Cave/Tunnel Bat
  private static drawBat(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    const t = Date.now() / 80;
    const wingY = Math.sin(t) * 4;
    // Dark body
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(10, 8, 8, 10);
    // Red eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(14, 10, 3, 2);
    // Wings flapping
    ctx.fillStyle = '#312e81';
    ctx.fillRect(2, 6 + wingY, 8, 6);
    ctx.fillRect(18, 6 + wingY, 8, 6);
  }

  // Pumpkin bomb
  private static drawPumpkinBomb(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    // Orange glowing pumpkin
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(2, 2, 16, 16);
    // Glowing green eyes and sinister smile
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(5, 5, 3, 3);
    ctx.fillRect(12, 5, 3, 3);
    ctx.fillRect(6, 12, 8, 3);
    // Stem
    ctx.fillStyle = '#15803d';
    ctx.fillRect(9, 0, 3, 3);
  }

  // Iconic Spider-Man Bosses
  static drawBoss(ctx: CanvasRenderingContext2D, type: BossType, boss: Enemy) {
    const w = boss.width;
    const h = boss.height;

    switch (type) {
      case 'scorpion':
        this.drawBossScorpion(ctx, w, h, boss);
        break;
      case 'rhino':
        this.drawBossRhino(ctx, w, h, boss);
        break;
      case 'lizard':
        this.drawBossLizard(ctx, w, h, boss);
        break;
      case 'sandman':
        this.drawBossSandman(ctx, w, h, boss);
        break;
      case 'vulture':
        this.drawBossVulture(ctx, w, h, boss);
        break;
      case 'electro':
        this.drawBossElectro(ctx, w, h, boss);
        break;
      case 'doc_ock':
        this.drawBossDocOck(ctx, w, h, boss);
        break;
      case 'mysterio':
        this.drawBossMysterio(ctx, w, h, boss);
        break;
      case 'kraven':
        this.drawBossKraven(ctx, w, h, boss);
        break;
      case 'venom':
        this.drawBossVenom(ctx, w, h, boss);
        break;
      case 'green_goblin':
        this.drawBossGreenGoblin(ctx, w, h, boss);
        break;
    }
  }

  // 1. ESCORPIÃO (Scorpion) - Green suit, menacing curved tail with stinger
  private static drawBossScorpion(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    // Tail arcing over head
    const t = Date.now() / 120;
    const tailWiggle = Math.sin(t) * 3;

    ctx.fillStyle = '#15803d'; // Green exoskeleton
    // Tail segments
    ctx.fillRect(4, 28, 6, 8);
    ctx.fillRect(0, 20, 6, 8);
    ctx.fillRect(0, 12, 6, 8);
    ctx.fillRect(4 + tailWiggle, 4, 8, 6);
    ctx.fillRect(12 + tailWiggle, 0, 10, 6);
    // Acid stinger
    ctx.fillStyle = '#84cc16'; // Glowing acid tip
    ctx.fillRect(22 + tailWiggle, 2, 8, 5);

    // Body
    ctx.fillStyle = '#166534';
    ctx.fillRect(10, 10, 20, 26);
    // Mask with yellow lenses
    ctx.fillStyle = '#15803d';
    ctx.fillRect(18, 6, 14, 12);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(26, 9, 5, 4);

    // Legs
    ctx.fillStyle = '#14532d';
    ctx.fillRect(12, 36, 7, 12);
    ctx.fillRect(22, 36, 7, 12);
  }

  // 2. RINO (Rhino) - Heavy grey bulky armor with massive front horn
  private static drawBossRhino(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    // Huge grey body
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 12, 28, 26);
    // Plated armor lines
    ctx.fillStyle = '#334155';
    ctx.fillRect(12, 16, 16, 3);
    ctx.fillRect(12, 24, 16, 3);

    // Head with huge horn
    ctx.fillStyle = '#64748b';
    ctx.fillRect(22, 8, 14, 14);
    // Horn
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(34, 4, 8, 6);
    ctx.fillRect(40, 0, 6, 6);
    // Secondary snout horn
    ctx.fillRect(36, 14, 4, 4);
    // Angry red eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(30, 12, 4, 3);

    // Thick legs
    ctx.fillStyle = '#334155';
    ctx.fillRect(8, 38, 10, 10);
    ctx.fillRect(22, 38, 10, 10);
  }

  // 3. O LAGARTO (The Lizard) - Scaly green skin, lab coat, reptilian claws
  private static drawBossLizard(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    // Long tail
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 32, 10, 6);
    ctx.fillRect(0, 38, 6, 6);

    // Body with white torn lab coat
    ctx.fillStyle = '#15803d';
    ctx.fillRect(10, 12, 18, 24);
    ctx.fillStyle = '#f8fafc'; // Torn lab coat
    ctx.fillRect(8, 16, 6, 18);
    ctx.fillRect(22, 16, 6, 18);

    // Reptile snout & head
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(18, 4, 16, 12);
    ctx.fillRect(30, 8, 8, 8); // Long snout
    // Yellow snake eyes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(26, 6, 4, 3);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(28, 6, 1, 3); // Slit pupil

    // Claws
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(10, 36, 8, 12);
    ctx.fillRect(22, 36, 8, 12);
  }

  // 4. HOMEM-AREIA (Sandman) - Striped shirt, massive morphing sand fist
  private static drawBossSandman(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    // Green striped shirt body
    ctx.fillStyle = '#15803d';
    ctx.fillRect(10, 12, 18, 18);
    ctx.fillStyle = '#0f766e'; // Dark stripes
    ctx.fillRect(10, 16, 18, 3);
    ctx.fillRect(10, 24, 18, 3);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(14, 4, 12, 10);
    ctx.fillStyle = '#78350f'; // Brown hair
    ctx.fillRect(14, 2, 12, 4);

    // Sand cyclone base / legs
    ctx.fillStyle = '#d97706';
    ctx.fillRect(8, 30, 22, 10);
    ctx.fillRect(12, 40, 14, 8);

    // Giant giant sand fist
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(26, 10, 14, 14);
    ctx.fillRect(38, 12, 6, 10);
  }

  // 5. O ABUTRE (Vulture) - Mechanical green wings, bald head, feathered collar
  private static drawBossVulture(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    const wingY = Math.sin(Date.now() / 100) * 4;

    // Huge steel feathered wings
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 10 + wingY, 14, 8);
    ctx.fillRect(0, 18 + wingY, 10, 8);
    ctx.fillRect(32, 10 + wingY, 14, 8);
    ctx.fillRect(36, 18 + wingY, 10, 8);

    // Green Flight suit
    ctx.fillStyle = '#15803d';
    ctx.fillRect(14, 14, 16, 20);
    // White feathered neck collar
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(12, 10, 20, 5);

    // Bald head & vulture beak mask
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(16, 4, 12, 8);
    ctx.fillStyle = '#eab308'; // Curved beak mask
    ctx.fillRect(26, 6, 6, 5);

    // Talons
    ctx.fillStyle = '#475569';
    ctx.fillRect(16, 34, 5, 10);
    ctx.fillRect(23, 34, 5, 10);
  }

  // 6. ELECTRO - Yellow lightning mask, crackling blue electrical energy
  private static drawBossElectro(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    const t = Date.now() / 50;

    // Electric suit (green & yellow)
    ctx.fillStyle = '#15803d';
    ctx.fillRect(10, 14, 16, 20);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(14, 14, 8, 20);

    // Iconic Lightning star mask!
    ctx.fillStyle = '#fde047';
    ctx.fillRect(14, 4, 12, 12);
    // Lightning points extending from head
    ctx.fillRect(10, 0, 4, 6);
    ctx.fillRect(22, 0, 4, 6);
    ctx.fillRect(6, 6, 6, 4);
    ctx.fillRect(28, 6, 6, 4);

    // Glowing electrical eyes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(18, 8, 6, 4);

    // Crackling sparks around hands
    ctx.fillStyle = '#38bdf8';
    const spark = Math.sin(t) * 3;
    ctx.fillRect(4, 20 + spark, 6, 6);
    ctx.fillRect(28, 20 - spark, 6, 6);

    // Boots
    ctx.fillStyle = '#facc15';
    ctx.fillRect(12, 34, 5, 12);
    ctx.fillRect(21, 34, 5, 12);
  }

  // 7. DOUTOR OCTOPUS (Doc Ock) - Green suit, goggles, and 4 metal tentacles
  private static drawBossDocOck(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    const t = Date.now() / 150;
    const wave = Math.sin(t) * 4;

    // 4 Articulated Steel Tentacles
    ctx.fillStyle = '#94a3b8';
    // Top-left tentacle
    ctx.fillRect(2, 6 + wave, 10, 5);
    ctx.fillRect(0, 0 + wave, 5, 8);
    // Bottom-left tentacle
    ctx.fillRect(2, 28 - wave, 10, 5);
    ctx.fillRect(0, 33 - wave, 5, 10);
    // Top-right tentacle
    ctx.fillRect(28, 4 - wave, 12, 5);
    ctx.fillRect(36, -2 - wave, 6, 8);
    // Bottom-right tentacle
    ctx.fillRect(28, 30 + wave, 12, 5);
    ctx.fillRect(36, 35 + wave, 6, 10);

    // Claw pincers
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(38, -4 - wave, 4, 4);
    ctx.fillRect(38, 43 + wave, 4, 4);

    // Body (Green trenchcoat)
    ctx.fillStyle = '#15803d';
    ctx.fillRect(10, 14, 18, 22);

    // Head, bowl cut & yellow goggles
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(14, 4, 12, 10);
    ctx.fillStyle = '#78350f'; // Brown hair
    ctx.fillRect(12, 2, 16, 4);
    // Yellow round goggles
    ctx.fillStyle = '#facc15';
    ctx.fillRect(18, 7, 8, 4);

    // Boots
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(12, 36, 6, 10);
    ctx.fillRect(20, 36, 6, 10);
  }

  // 8. MYSTERIO - Purple cape, fishbowl fog helmet, mystical illusion runes
  private static drawBossMysterio(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    // Purple cape
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(6, 10, 24, 28);
    ctx.fillRect(2, 14, 6, 20);
    ctx.fillRect(28, 14, 6, 20);

    // Green textured grid armor
    ctx.fillStyle = '#15803d';
    ctx.fillRect(12, 14, 14, 18);
    // Gold medallion clasps
    ctx.fillStyle = '#facc15';
    ctx.fillRect(10, 12, 4, 4);
    ctx.fillRect(24, 12, 4, 4);

    // Mystical Smoke Glass Helmet
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(11, 0, 16, 14);
    ctx.fillStyle = '#f3e8ff'; // Glowing pearlescent fog reflection
    ctx.fillRect(13, 2, 12, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 3, 5, 4);

    // Boots
    ctx.fillStyle = '#15803d';
    ctx.fillRect(12, 32, 6, 12);
    ctx.fillRect(20, 32, 6, 12);
  }

  // 9. KRAVEN, O CAÇADOR - Lion vest, animal print, spear
  private static drawBossKraven(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    // Body with Lion Head vest
    ctx.fillStyle = '#b45309';
    ctx.fillRect(10, 12, 18, 18);
    // Lion mane & eyes on vest
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(12, 14, 14, 10);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(14, 16, 3, 3);
    ctx.fillRect(21, 16, 3, 3);

    // Kraven Head & mustache
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(14, 4, 12, 10);
    ctx.fillStyle = '#0f172a'; // Black hair & beard
    ctx.fillRect(14, 2, 12, 3);
    ctx.fillRect(16, 10, 8, 3); // Mustache

    // Hunting Spear in hand
    ctx.fillStyle = '#78350f'; // Shaft
    ctx.fillRect(28, -6, 3, 40);
    ctx.fillStyle = '#cbd5e1'; // Spearhead
    ctx.fillRect(27, -12, 5, 8);

    // Zebra/Leopard tights & boots
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(12, 30, 6, 8);
    ctx.fillRect(20, 30, 6, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(12, 38, 6, 8);
    ctx.fillRect(20, 38, 6, 8);
  }

  // 10. VENOM - Huge black muscular symbiote, white spider, fangs & red tongue
  private static drawBossVenom(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    // Large hulking body (Deep Black)
    ctx.fillStyle = '#020617';
    ctx.fillRect(8, 8, 28, 30);

    // Giant White Spider Emblem on chest
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 14, 6, 8);
    ctx.fillRect(14, 12, 14, 3);
    ctx.fillRect(12, 18, 18, 2);
    // Spider legs stretching outwards
    ctx.fillRect(10, 10, 3, 6);
    ctx.fillRect(29, 10, 3, 6);
    ctx.fillRect(10, 22, 3, 8);
    ctx.fillRect(29, 22, 3, 8);

    // Head with jagged white eyes & mouth
    ctx.fillStyle = '#020617';
    ctx.fillRect(16, 0, 20, 16);
    // Jagged white eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24, 4, 8, 4);
    ctx.fillRect(27, 2, 5, 3);

    // Sinister fangs & long red symbiote tongue
    ctx.fillStyle = '#ffffff'; // Sharp fangs
    ctx.fillRect(22, 10, 12, 2);
    ctx.fillStyle = '#dc2626'; // Red tongue curling out
    const tongueWiggle = Math.sin(Date.now() / 80) * 3;
    ctx.fillRect(30, 11, 8 + tongueWiggle, 4);
    ctx.fillRect(36 + tongueWiggle, 13, 4, 6);

    // Heavy legs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 38, 10, 12);
    ctx.fillRect(24, 38, 10, 12);
  }

  // 11. DUENDE VERDE (Green Goblin) - Glider, green goblin suit, purple hood, throwing pumpkin bomb
  private static drawBossGreenGoblin(ctx: CanvasRenderingContext2D, w: number, h: number, boss: Enemy) {
    const gliderHover = Math.sin(Date.now() / 100) * 4;

    // Goblin Glider (Metallic silver bat-wing jet)
    ctx.fillStyle = '#475569';
    ctx.fillRect(2, 36 + gliderHover, 36, 6);
    ctx.fillRect(12, 34 + gliderHover, 16, 4);
    ctx.fillRect(0, 32 + gliderHover, 6, 8);
    ctx.fillRect(34, 32 + gliderHover, 6, 8);

    // Glider Jet thruster fire (Orange & Yellow)
    ctx.fillStyle = '#f97316';
    ctx.fillRect(16, 42 + gliderHover, 8, 6);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(18, 44 + gliderHover, 4, 4);

    // Goblin Body (Green skin, purple tunic)
    ctx.fillStyle = '#15803d'; // Green arms & legs
    ctx.fillRect(12, 14 + gliderHover, 16, 18);
    ctx.fillStyle = '#7e22ce'; // Purple tunic
    ctx.fillRect(14, 14 + gliderHover, 12, 14);

    // Head (Green face, pointed ears, purple pointed cap)
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(16, 4 + gliderHover, 12, 10);
    // Big pointed ears
    ctx.fillRect(12, 6 + gliderHover, 4, 4);
    ctx.fillRect(28, 6 + gliderHover, 4, 4);
    // Purple cowl/cap drooping back
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(14, 0 + gliderHover, 14, 5);
    ctx.fillRect(8, 2 + gliderHover, 6, 6);

    // Yellow sinister glowing eyes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(22, 6 + gliderHover, 4, 3);

    // Holding a glowing pumpkin bomb ready to throw!
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(28, 12 + gliderHover, 8, 8);
    ctx.fillStyle = '#22c55e'; // Pumpkin glowing smile
    ctx.fillRect(30, 15 + gliderHover, 4, 2);
  }

  // Draw Blocks (Ground, Brick, Question Blocks, Pipes)
  static drawBlock(ctx: CanvasRenderingContext2D, block: Block, groundColor: string) {
    const yOffset = block.bounceOffset || 0;
    const x = block.x;
    const y = block.y + yOffset;
    const w = block.width;
    const h = block.height;

    switch (block.type) {
      case 'ground':
        // Street Asphalt / Sidewalk
        ctx.fillStyle = groundColor;
        ctx.fillRect(x, y, w, h);
        // Curb highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, 2);
        // Brick tile grooves
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y + 8, w, 1);
        ctx.fillRect(x, y + 16, w, 1);
        break;

      case 'brick':
        // Classic Mario-style Brown/Red Brick block
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x, y, w, h);
        // Brick borders
        ctx.fillStyle = '#000000';
        ctx.strokeRect(x, y, w, h);
        // Brick mortar lines
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(x + 2, y + 2, w - 4, 1);
        ctx.fillRect(x + 2, y + h / 2, w - 4, 1);
        ctx.fillRect(x + w / 2, y + 2, 1, h / 2 - 2);
        ctx.fillRect(x + w / 4, y + h / 2, 1, h / 2 - 2);
        ctx.fillRect(x + (3 * w) / 4, y + h / 2, 1, h / 2 - 2);
        break;

      case 'question':
        // Classic Mario ? Block (Spider Web Gold Box)
        if (block.isHit) {
          // Empty brown box
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#451a03';
          ctx.strokeRect(x, y, w, h);
        } else {
          // Shimmering Golden Box
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#ca8a04';
          ctx.strokeRect(x, y, w, h);
          // Highlight
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 2, y + 2, w - 4, 2);
          ctx.fillRect(x + 2, y + 2, 2, h - 4);
          // Question Mark "?" in pixel style
          ctx.fillStyle = '#451a03';
          ctx.font = '14px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', x + w / 2, y + h / 2);
        }
        break;

      case 'pipe':
        // Urban NYC Subway Vent / Ventilation Pipe
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x, y, w, h);
        // Pipe Rim at the top
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x - 2, y, w + 4, 8);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(x + w - 4, y, 4, h);
        break;

      case 'spike':
        // Hazard electricity / barbed wire
        ctx.fillStyle = '#eab308';
        for (let i = 0; i < w; i += 8) {
          ctx.beginPath();
          ctx.moveTo(x + i, y + h);
          ctx.lineTo(x + i + 4, y);
          ctx.lineTo(x + i + 8, y + h);
          ctx.fill();
        }
        break;

      case 'building':
        // Skyscraper facade in the background of the sidewalk
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, w, h);

        // Rooftop ledge & parapet
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - 2, y, w + 4, 6);
        // Roof antenna/spire
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + w / 2 - 1, y - 14, 3, 14);
        ctx.fillStyle = '#ef4444'; // Red beacon light on spire
        ctx.fillRect(x + w / 2 - 1, y - 16, 3, 2);

        // Windows along upper floors
        ctx.fillStyle = '#facc15';
        for (let wy = y + 14; wy < y + h - 50; wy += 20) {
          for (let wx = x + 8; wx < x + w - 8; wx += 16) {
            if ((Math.floor(wx / 16) + Math.floor(wy / 20)) % 3 !== 0) {
              ctx.fillRect(wx, wy, 8, 10);
            }
          }
        }

        // Ground-level storefront entrance / awning (sidewalk passes in front)
        ctx.fillStyle = '#b91c1c'; // Red storefront awning
        ctx.fillRect(x + 4, y + h - 46, w - 8, 8);
        ctx.fillStyle = '#0f172a'; // Glass doors / windows in background
        ctx.fillRect(x + 8, y + h - 38, w - 16, 36);
        ctx.fillStyle = '#fde047'; // Store sign
        ctx.fillRect(x + 12, y + h - 34, w - 24, 4);
        break;
    }
  }

  // Draw Collectibles (Coins, Pizza Slices, Spider Tokens)
  static drawCollectible(ctx: CanvasRenderingContext2D, c: Collectible) {
    if (c.collected) return;
    const bob = Math.sin(Date.now() / 150 + c.bobOffset) * 3;
    const x = c.x;
    const y = c.y + bob;

    if (c.type === 'coin') {
      // Golden Spider Coin
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 7, y + 7, 4, 0, Math.PI * 2);
      ctx.fill();
      // Coin spider web icon
      ctx.fillStyle = '#713f12';
      ctx.fillRect(x + 7, y + 5, 2, 6);
      ctx.fillRect(x + 5, y + 7, 6, 2);
    } else if (c.type === 'pizza') {
      // Slice of Pepperoni Pizza! (Restores Health)
      ctx.fillStyle = '#eab308'; // Cheese triangle
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 15);
      ctx.lineTo(x + 1, y + 2);
      ctx.lineTo(x + 15, y + 2);
      ctx.closePath();
      ctx.fill();

      // Brown crust
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y, 16, 4);

      // Pepperoni slices
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 4, y + 6, 3, 3);
      ctx.fillRect(x + 9, y + 8, 3, 3);
    } else if (c.type === 'spider_token') {
      // Radioactive Spider Token
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + 9, y + 9, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 8, y + 4, 2, 10);
      ctx.fillRect(x + 4, y + 8, 10, 2);
    }
  }

  // Draw Projectiles (Web balls, pumpkin bombs, acid, lightning)
  static drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
    ctx.save();
    if (p.type === 'web') {
      // White spider web ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
      // Web strands
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.height / 2);
      ctx.lineTo(p.x + p.width, p.y + p.height / 2);
      ctx.moveTo(p.x + p.width / 2, p.y);
      ctx.lineTo(p.x + p.width / 2, p.y + p.height);
      ctx.stroke();
    } else if (p.type === 'pumpkin') {
      // Glowing pumpkin bomb
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(p.x + 3, p.y + 3, 3, 3);
      ctx.fillRect(p.x + 8, p.y + 3, 3, 3);
    } else if (p.type === 'lightning') {
      // Jagged electric spark
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x, p.y + 2, p.width, 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(p.x + 2, p.y, p.width - 4, 8);
    } else if (p.type === 'acid') {
      // Green acid glob
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }
    ctx.restore();
  }

  // Draw Web-Slinging Rope
  static drawWebLine(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
    ctx.save();
    // Glowing white web strand
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Subtle web joint knots
    const steps = 6;
    ctx.fillStyle = '#f1f5f9';
    for (let i = 1; i < steps; i++) {
      const qx = startX + (endX - startX) * (i / steps);
      const qy = startY + (endY - startY) * (i / steps);
      ctx.beginPath();
      ctx.arc(qx, qy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anchor point burst
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Flagpole (Mario level goal with Daily Bugle / Spider flag and lock status)
  static drawFlagpole(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, isTriggered: boolean, isUnlocked: boolean = true) {
    ctx.save();

    // Glowing aura if unlocked!
    if (isUnlocked && !isTriggered) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.beginPath();
      ctx.arc(x + 8, y + height / 2, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Metal pole
    ctx.fillStyle = isUnlocked ? '#cbd5e1' : '#64748b';
    ctx.fillRect(x + 6, y, 4, height);

    // Golden sphere top
    ctx.fillStyle = isUnlocked ? '#facc15' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(x + 8, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Base block
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + height - 16, 16, 16);

    // Lock status icon at base if locked
    if (!isUnlocked) {
      // Red padlock badge
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 1, y + height - 14, 14, 12);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 5, y + height - 18, 6, 5); // shackle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 6, y + height - 17, 4, 4);
    }

    // Spider Flag (descends when triggered)
    const flagY = isTriggered ? y + height - 36 : y + 6;
    ctx.fillStyle = isUnlocked ? '#dc2626' : '#475569';
    ctx.fillRect(x + 10, flagY, 28, 18);
    // Spider logo on flag
    ctx.fillStyle = isUnlocked ? '#ffffff' : '#94a3b8';
    ctx.fillRect(x + 22, flagY + 6, 4, 6);
    ctx.fillRect(x + 20, flagY + 8, 8, 2);

    // "SAÍDA" / "BLOQUEADO" sign text above pole
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    if (isUnlocked) {
      ctx.fillStyle = '#facc15';
      ctx.fillText('★ SAÍDA ★', x + 8, y - 8);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('TRANCADO', x + 8, y - 8);
    }

    ctx.restore();
  }
}
