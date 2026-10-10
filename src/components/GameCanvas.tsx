/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { SpriteRenderer } from '../game/sprites';
import { GameState } from '../types/game';

interface GameCanvasProps {
  engine: GameEngine;
  onGameStateChange: (state: GameState) => void;
  showScanlines: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  onGameStateChange,
  showScanlines,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp pixel rendering
    ctx.imageSmoothingEnabled = false;

    let animationId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update engine state
      const nextState = engine.update(delta);
      if (nextState) {
        onGameStateChange(nextState);
      }

      // Render Scene
      renderScene(ctx, engine);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [engine, onGameStateChange]);

  const renderScene = (ctx: CanvasRenderingContext2D, eng: GameEngine) => {
    const { player, blocks, collectibles, projectiles, enemies, particles, flagpole, cameraX, levelConfig, activeBoss } = eng.state;
    const w = 480;
    const h = 270;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Sky & Parallax Skyline
    drawParallaxSkyline(ctx, cameraX, levelConfig, w, h);

    // 2. Camera Transform
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);

    // 3. Draw Blocks (Buildings, Ground, Pipes, Bricks, Question Blocks)
    for (const block of blocks) {
      if (block.x + block.width >= cameraX - 50 && block.x <= cameraX + w + 50) {
        SpriteRenderer.drawBlock(ctx, block, levelConfig.groundColor);
      }
    }

    // 4. Draw Collectibles
    for (const c of collectibles) {
      if (c.x >= cameraX - 20 && c.x <= cameraX + w + 20) {
        SpriteRenderer.drawCollectible(ctx, c);
      }
    }

    // 5. Draw Flagpole with lock/unlock status
    const objectives = eng.getLevelObjectivesStatus();
    if (flagpole.x >= cameraX - 50 && flagpole.x <= cameraX + w + 50) {
      SpriteRenderer.drawFlagpole(ctx, flagpole.x, flagpole.y, flagpole.height, flagpole.isTriggered, objectives.canPassLevel);
    }

    // 6. Draw Web-Sling line if swinging
    if (player.isSwinging) {
      SpriteRenderer.drawWebLine(
        ctx,
        player.x + (player.facing === 'right' ? 20 : 8),
        player.y + 4,
        player.swingAnchorX,
        player.swingAnchorY
      );
    }

    // 7. Draw Projectiles
    for (const p of projectiles) {
      SpriteRenderer.drawProjectile(ctx, p);
    }

    // 8. Draw Enemies & Bosses
    for (const enemy of enemies) {
      if (enemy.x + enemy.width >= cameraX - 40 && enemy.x <= cameraX + w + 40) {
        SpriteRenderer.drawEnemy(ctx, enemy);
      }
    }

    // 9. Draw Spider-Man
    SpriteRenderer.drawPlayer(ctx, player);

    // 10. Draw Symbiote Arm / Tendril Grapple
    SpriteRenderer.drawSymbioteArm(ctx, player);

    // 11. Draw Particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }

    ctx.restore(); // Restore camera transform

    // 11. Draw Retro Arcade 8-bit HUD overlay
    drawHUD(ctx, eng, w, h);
  };

  // Parallax NYC Skyline
  const drawParallaxSkyline = (
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    level: { skyColor: string; theme: string },
    w: number,
    h: number
  ) => {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, level.skyColor);
    skyGrad.addColorStop(0.7, '#0f172a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun or Moon
    ctx.fillStyle = level.theme === 'day' ? '#fde047' : '#f8fafc';
    ctx.beginPath();
    ctx.arc(w - 70, 45, level.theme === 'day' ? 18 : 12, 0, Math.PI * 2);
    ctx.fill();

    // Distant NYC Silhouettes (Parallax factor 0.15)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    const distOffset = (cameraX * 0.15) % 300;
    for (let x = -distOffset; x < w + 100; x += 60) {
      const bh = 70 + ((x * 13) % 45);
      ctx.fillRect(x, h - bh - 40, 50, bh);
      // Spire on top (Empire State style)
      if ((x % 120) === 0) {
        ctx.fillRect(x + 23, h - bh - 60, 4, 20);
      }
    }

    // Midground Skylines (Parallax factor 0.35) with lit windows
    ctx.fillStyle = '#1e293b';
    const midOffset = (cameraX * 0.35) % 240;
    for (let x = -midOffset; x < w + 80; x += 45) {
      const bh = 95 + ((x * 7) % 55);
      ctx.fillRect(x, h - bh - 20, 38, bh);

      // Lit yellow windows
      ctx.fillStyle = '#fef08a';
      for (let wy = h - bh; wy < h - 30; wy += 12) {
        if ((x + wy) % 4 !== 0) {
          ctx.fillRect(x + 6, wy, 4, 6);
          ctx.fillRect(x + 16, wy, 4, 6);
          ctx.fillRect(x + 26, wy, 4, 6);
        }
      }
      ctx.fillStyle = '#1e293b';
    }

    // Neon Bugle / Leon Gabriel Billboard in sky
    const signX = 260 - (cameraX * 0.2) % 600;
    if (signX > -150 && signX < w + 50) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(signX, 65, 80, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('LEON SPIDER', signX + 4, 77);
    }
  };

  // Draw 8-Bit HUD
  const drawHUD = (ctx: CanvasRenderingContext2D, eng: GameEngine, w: number, h: number) => {
    const { player, levelConfig, activeBoss } = eng.state;

    // Top HUD Bar
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px "Press Start 2P", monospace';

    // Player Name & Score
    ctx.fillText('LEON', 16, 16);
    ctx.fillText(player.score.toString().padStart(6, '0'), 16, 26);

    // Coins
    ctx.fillStyle = '#eab308';
    ctx.fillRect(110, 10, 6, 6);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`x${player.coins.toString().padStart(2, '0')}`, 120, 16);

    // World & Level
    ctx.fillText('FASE', 180, 16);
    ctx.fillText(`${levelConfig.id}/11`, 190, 26);

    // Lives
    ctx.fillStyle = '#ef4444';
    // Mini spider icon
    ctx.fillRect(260, 10, 6, 6);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`x${player.lives}`, 272, 16);

    // Health Hearts (Max 4)
    ctx.fillText('VIDA', 330, 16);
    for (let hp = 0; hp < player.maxHealth; hp++) {
      if (hp < player.health) {
        ctx.fillStyle = '#ef4444'; // Red heart
        ctx.fillRect(380 + hp * 10, 9, 8, 8);
      } else {
        ctx.fillStyle = '#475569'; // Empty heart
        ctx.fillRect(380 + hp * 10, 9, 8, 8);
      }
    }

    // Web Cooldown Indicator (Left)
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    if (player.webCooldown > 0) {
      ctx.fillStyle = '#f87171';
      ctx.fillText(`TEIA: ${Math.ceil(player.webCooldown / 60)}s`, 16, 38);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('TEIA: OK', 16, 38);
    }

    // Objective Banner (Center)
    const objStatus = eng.getLevelObjectivesStatus();
    ctx.textAlign = 'center';
    if (objStatus.canPassLevel) {
      ctx.fillStyle = '#facc15';
      ctx.fillText('★ SAÍDA LIBERADA! VÁ ATÉ O MASTRO! ★', w / 2, 38);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`MISSÃO: ${objStatus.aliveEnemies} VILÕES OU ${objStatus.remainingCollectibles} PONTOS`, w / 2, 38);
    }

    // Venom Symbiote Mode Indicator (Right, Level 6+)
    ctx.textAlign = 'right';
    if (levelConfig.id >= 6) {
      if (player.isSymbiote) {
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`★ VENOM: ${Math.ceil(player.symbioteTimer / 60)}s ★`, w - 16, 38);
      } else if (player.symbioteCooldown > 0) {
        ctx.fillStyle = '#64748b';
        ctx.fillText(`VENOM: ${Math.ceil(player.symbioteCooldown / 60)}s`, w - 16, 38);
      } else {
        ctx.fillStyle = '#a855f7';
        ctx.fillText('★ VENOM: [V] OK ★', w - 16, 38);
      }
    }
    ctx.textAlign = 'left';

    // Boss Health Bar (if active and on-screen)
    if (activeBoss && !activeBoss.isDead && activeBoss.x < eng.state.cameraX + w + 100) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(w / 2 - 110, h - 34, 220, 26);
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2;
      ctx.strokeRect(w / 2 - 110, h - 34, 220, 26);

      // Boss Name
      ctx.fillStyle = '#facc15';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(levelConfig.boss.name, w / 2, h - 22);

      // Boss HP gauge
      const barW = 190;
      const pct = Math.max(0, activeBoss.health / activeBoss.maxHealth);
      ctx.fillStyle = '#334155';
      ctx.fillRect(w / 2 - barW / 2, h - 17, barW, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(w / 2 - barW / 2, h - 17, barW * pct, 6);
      ctx.textAlign = 'left';
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-slate-800">
      <canvas
        ref={canvasRef}
        width={480}
        height={270}
        className="w-full h-full pixel-crisp block"
      />
      {showScanlines && <div className="absolute inset-0 scanlines pointer-events-none" />}
      <div className="absolute inset-0 crt-flicker pointer-events-none" />
    </div>
  );
};
