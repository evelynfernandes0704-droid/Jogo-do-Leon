/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { Pause, Play, Volume2, VolumeX, Maximize, Minimize, List } from 'lucide-react';

interface VirtualGamepadProps {
  engine: GameEngine;
  onTogglePause?: () => void;
  onToggleMute?: () => void;
  onOpenLevelSelect?: () => void;
  isPaused?: boolean;
  isMuted?: boolean;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({
  engine,
  onTogglePause,
  onToggleMute,
  onOpenLevelSelect,
  isPaused = false,
  isMuted = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const triggerHaptic = (duration = 12) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Haptics optional fallback
      }
    }
  };

  const setKey = (
    key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'shoot' | 'swing' | 'punch',
    pressed: boolean
  ) => {
    if (pressed) {
      triggerHaptic(key === 'punch' || key === 'shoot' ? 18 : 12);
    }
    engine.state.keys[key] = pressed;
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-2 sm:mt-4 px-2 sm:px-4 select-none touch-none">
      {/* Mobile Quick Bar (Pause, Mute, Fullscreen, Levels) */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onTogglePause && (
            <button
              type="button"
              onClick={onTogglePause}
              className="px-2.5 py-1.5 bg-slate-900 active:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-pixel text-[10px] flex items-center gap-1 shadow cursor-pointer active:scale-95 transition-transform"
              aria-label={isPaused ? 'Continuar jogo' : 'Pausar jogo'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isPaused ? 'CONTINUAR' : 'PAUSA'}</span>
            </button>
          )}

          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 bg-slate-900 active:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 shadow cursor-pointer active:scale-95 transition-transform"
              aria-label={isMuted ? 'Ativar áudio' : 'Desativar áudio'}
              title={isMuted ? 'Ativar áudio' : 'Desativar áudio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          )}

          {onOpenLevelSelect && (
            <button
              type="button"
              onClick={onOpenLevelSelect}
              className="px-2 py-1.5 bg-slate-900 active:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-pixel text-[10px] flex items-center gap-1 shadow cursor-pointer active:scale-95 transition-transform"
              aria-label="Abrir seleção de fases"
            >
              <List className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xs:inline">FASES</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="px-2.5 py-1.5 bg-slate-900 active:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-pixel text-[10px] flex items-center gap-1 shadow cursor-pointer active:scale-95 transition-transform"
          aria-label="Alternar tela cheia"
          title="Modo Tela Cheia para Celular / App"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-amber-400" /> : <Maximize className="w-3.5 h-3.5 text-sky-400" />}
          <span>{isFullscreen ? 'JANELA' : 'APP TELA CHEIA'}</span>
        </button>
      </div>

      {/* Main Touch Controls Layout */}
      <div className="flex items-center justify-between gap-3 sm:gap-6 bg-slate-950/70 p-2 sm:p-3 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-sm">
        {/* D-PAD (Esquerda / Baixo / Direita + Cima) */}
        <div className="flex flex-col items-center select-none">
          {/* Up arrow for jump/aim */}
          <button
            type="button"
            onMouseDown={() => setKey('up', true)}
            onMouseUp={() => setKey('up', false)}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('up', true); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('up', false); }}
            onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('up', false); }}
            className="w-12 h-10 sm:w-14 sm:h-12 bg-slate-800/90 active:bg-red-700 text-white rounded-t-xl flex items-center justify-center font-bold text-base sm:text-lg border-2 border-slate-700 shadow-md active:scale-95 transition-transform cursor-pointer touch-none"
            aria-label="Olhar para cima"
          >
            ▲
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Left arrow */}
            <button
              type="button"
              onMouseDown={() => setKey('left', true)}
              onMouseUp={() => setKey('left', false)}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('left', true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('left', false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('left', false); }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/90 active:bg-red-700 text-white rounded-l-xl flex items-center justify-center font-bold text-lg sm:text-xl border-2 border-slate-700 shadow-md active:scale-95 transition-transform cursor-pointer touch-none"
              aria-label="Mover para esquerda"
            >
              ◀
            </button>

            {/* Down arrow */}
            <button
              type="button"
              onMouseDown={() => setKey('down', true)}
              onMouseUp={() => setKey('down', false)}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('down', true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('down', false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('down', false); }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/90 active:bg-red-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl border-2 border-slate-700 shadow-md active:scale-95 transition-transform cursor-pointer touch-none"
              aria-label="Abaixar"
            >
              ▼
            </button>

            {/* Right arrow */}
            <button
              type="button"
              onMouseDown={() => setKey('right', true)}
              onMouseUp={() => setKey('right', false)}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('right', true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('right', false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('right', false); }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/90 active:bg-red-700 text-white rounded-r-xl flex items-center justify-center font-bold text-lg sm:text-xl border-2 border-slate-700 shadow-md active:scale-95 transition-transform cursor-pointer touch-none"
              aria-label="Mover para direita"
            >
              ▶
            </button>
          </div>
          <span className="text-[8px] text-slate-500 font-pixel mt-1">D-PAD</span>
        </div>

        {/* Action Buttons: VENOM (Level 6+), SOCO (Fist), TIRO TEIA / AGARRAR, SWING, PULO */}
        <div className="flex items-center gap-1.5 sm:gap-3 touch-none select-none">
          {/* Level 6+ Special Venom Transformation Button */}
          {engine.state.levelConfig.id >= 6 && (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(25);
                  engine.activateSymbioteMode();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerHaptic(25);
                  engine.activateSymbioteMode();
                }}
                disabled={!engine.state.player.isSymbiote && engine.state.player.symbioteCooldown > 0}
                className={`w-12 h-12 sm:w-14 sm:h-14 font-pixel text-xs rounded-full flex flex-col items-center justify-center border-2 shadow-lg transition-transform cursor-pointer touch-none active:scale-90 ${
                  engine.state.player.isSymbiote
                    ? 'bg-purple-900 border-purple-400 text-purple-200 shadow-purple-950/80 animate-pulse ring-2 ring-purple-400'
                    : engine.state.player.symbioteCooldown > 0
                    ? 'bg-slate-900 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-br from-purple-700 to-slate-950 border-purple-400 text-white shadow-purple-950/60 ring-2 ring-purple-500/50'
                }`}
                aria-label="Ativar Modo Venom Simbiose"
              >
                <span className="text-sm sm:text-base leading-none">🧬</span>
                <span className="text-[7px] sm:text-[8px] mt-0.5 font-bold">
                  {engine.state.player.isSymbiote
                    ? `${Math.ceil(engine.state.player.symbioteTimer / 60)}s`
                    : engine.state.player.symbioteCooldown > 0
                    ? `${Math.ceil(engine.state.player.symbioteCooldown / 60)}s`
                    : 'VENOM'}
                </span>
              </button>
              <span className="text-[8px] sm:text-[9px] text-purple-400 mt-0.5 font-mono">V</span>
            </div>
          )}

          {/* Punch Button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onMouseDown={() => setKey('punch', true)}
              onMouseUp={() => setKey('punch', false)}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('punch', true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('punch', false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('punch', false); }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-amber-700 active:from-amber-400 active:to-amber-600 text-white font-pixel text-xs rounded-full flex flex-col items-center justify-center border-2 border-amber-300 shadow-lg shadow-amber-950/50 active:scale-90 transition-transform cursor-pointer touch-none"
              aria-label="Dar soco"
            >
              <span className="text-sm sm:text-base leading-none">🥊</span>
              <span className="text-[7px] sm:text-[8px] mt-0.5">SOCO</span>
            </button>
            <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 font-mono">Z / F</span>
          </div>

          {/* Web Shoot / Symbiote Grab Button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onMouseDown={() => setKey('shoot', true)}
              onMouseUp={() => setKey('shoot', false)}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('shoot', true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('shoot', false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('shoot', false); }}
              className={`w-12 h-12 sm:w-14 sm:h-14 font-pixel text-xs rounded-full flex flex-col items-center justify-center border-2 shadow-lg active:scale-90 transition-transform cursor-pointer touch-none ${
                engine.state.player.isSymbiote
                  ? 'bg-gradient-to-br from-purple-800 to-slate-950 border-purple-400 text-white shadow-purple-950/50'
                  : engine.state.player.webCooldown > 0
                  ? 'bg-red-950/80 border-red-800 text-red-300 opacity-75'
                  : 'bg-gradient-to-br from-red-600 to-red-800 active:from-red-500 active:to-red-700 text-white border-red-400 shadow-red-950/50'
              }`}
              aria-label={engine.state.player.isSymbiote ? 'Agarrar com Simbiose' : 'Atirar teia'}
            >
              <span className="text-sm sm:text-base leading-none">
                {engine.state.player.isSymbiote ? '🦑' : '🕸️'}
              </span>
              <span className="text-[7px] sm:text-[8px] mt-0.5">
                {engine.state.player.isSymbiote
                  ? 'AGARRAR'
                  : engine.state.player.webCooldown > 0
                  ? `${Math.ceil(engine.state.player.webCooldown / 60)}s`
                  : 'TEIA'}
              </span>
            </button>
            <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 font-mono">X</span>
          </div>

          {/* Web Swing Button (C) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onMouseDown={() => setKey('swing', true)}
              onMouseUp={() => setKey('swing', false)}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('swing', true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('swing', false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('swing', false); }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-500 to-sky-700 active:from-sky-400 active:to-sky-600 text-white font-pixel text-xs rounded-full flex flex-col items-center justify-center border-2 border-sky-300 shadow-lg shadow-sky-950/50 active:scale-90 transition-transform cursor-pointer touch-none"
              aria-label="Balançar na teia"
            >
              <span className="text-sm sm:text-base leading-none">🏙️</span>
              <span className="text-[7px] sm:text-[8px] mt-0.5">SWING</span>
            </button>
            <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 font-mono">C</span>
          </div>

          {/* Jump Button (A) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onMouseDown={() => setKey('jump', true)}
              onMouseUp={() => setKey('jump', false)}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setKey('jump', true); }}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setKey('jump', false); }}
              onTouchCancel={(e) => { e.preventDefault(); e.stopPropagation(); setKey('jump', false); }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 active:from-emerald-400 active:to-emerald-600 text-white font-pixel text-xs sm:text-sm rounded-full flex flex-col items-center justify-center border-2 border-emerald-300 shadow-lg shadow-emerald-950/50 active:scale-90 transition-transform cursor-pointer touch-none"
              aria-label="Pular"
            >
              <span className="text-base sm:text-lg leading-none">⬆</span>
              <span className="text-[8px] sm:text-[9px] mt-0.5">PULO</span>
            </button>
            <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 font-mono">Espaço</span>
          </div>
        </div>
      </div>
    </div>
  );
};
