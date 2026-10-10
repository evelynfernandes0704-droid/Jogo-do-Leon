/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GAME_LEVELS } from './game/levels';
import { GameState } from './types/game';
import { sound } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { VirtualGamepad } from './components/VirtualGamepad';
import { DedicationBanner } from './components/DedicationBanner';
import { DedicationModal } from './components/DedicationModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ControlsModal } from './components/ControlsModal';
import { LevelClearModal } from './components/LevelClearModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { TitleScreen } from './components/TitleScreen';
import { Volume2, VolumeX, Pause, Play, RotateCcw, HelpCircle, Heart, List, Tv } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [health, setHealth] = useState<number>(4);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);

  // Modals
  const [isDedicationOpen, setIsDedicationOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

  // Game Engine instance
  const engineRef = useRef<GameEngine | null>(null);

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const savedUnlocked = localStorage.getItem('spidey_leon_unlocked');
      if (savedUnlocked) {
        const parsed = JSON.parse(savedUnlocked);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUnlockedLevels(parsed);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Save unlocked progress
  const unlockLevel = useCallback((lvlId: number) => {
    setUnlockedLevels((prev) => {
      if (!prev.includes(lvlId)) {
        const updated = [...prev, lvlId].sort((a, b) => a - b);
        try {
          localStorage.setItem('spidey_leon_unlocked', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return prev;
    });
  }, []);

  // Initialize or re-initialize the game engine for a level
  const initLevel = useCallback((levelIndex: number, keepLives: number = 3, currentScore: number = 0) => {
    const levelConfig = GAME_LEVELS[levelIndex];
    const engine = new GameEngine(levelConfig, levelIndex, keepLives, currentScore);

    engine.onScoreChange = (newScore, newCoins, newLives, newHealth) => {
      setScore(newScore);
      setCoins(newCoins);
      setLives(newLives);
      setHealth(newHealth);
    };

    engineRef.current = engine;
    setCurrentLevelIndex(levelIndex);
  }, []);

  // Start Playing
  const handleStartGame = useCallback((levelIndex: number = currentLevelIndex) => {
    sound.startMusic();
    initLevel(levelIndex, 3, 0);
    setGameState('PLAYING');
  }, [currentLevelIndex, initLevel]);

  // Handle Game State Changes triggered by engine
  const handleGameStateChange = useCallback((nextState: GameState) => {
    if (nextState === 'LEVEL_CLEAR') {
      sound.stopMusic();
      const nextLvlId = GAME_LEVELS[currentLevelIndex].id + 1;
      if (nextLvlId <= 11) {
        unlockLevel(nextLvlId);
      }
      if (currentLevelIndex === 10) {
        // Beat Level 11 - Grand Finale!
        setGameState('VICTORY');
        return;
      }
    } else if (nextState === 'GAME_OVER' || nextState === 'VICTORY') {
      sound.stopMusic();
    }
    setGameState(nextState);
  }, [currentLevelIndex, unlockLevel]);

  // Next Level Handler
  const handleNextLevel = () => {
    const nextIndex = currentLevelIndex + 1;
    if (nextIndex < GAME_LEVELS.length) {
      initLevel(nextIndex, lives, score);
      sound.startMusic();
      setGameState('PLAYING');
    } else {
      setGameState('VICTORY');
    }
  };

  // Replay Current Level
  const handleReplayLevel = () => {
    initLevel(currentLevelIndex, 3, score);
    sound.startMusic();
    setGameState('PLAYING');
  };

  // Toggle Pause
  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      if (engineRef.current) engineRef.current.state.isPaused = true;
      sound.stopMusic();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      if (engineRef.current) engineRef.current.state.isPaused = false;
      sound.startMusic();
      setGameState('PLAYING');
    }
  };

  // Toggle Sound
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.setSoundMute(nextMute);
    sound.setMusicMute(nextMute);
  };

  // Global Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const engine = engineRef.current;
      if (!engine) return;

      // Prevent scroll on gaming keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const keys = engine.state.keys;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keys.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keys.right = true;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          keys.up = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          keys.down = true;
          break;
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          keys.jump = true;
          break;
        case 'z':
        case 'Z':
        case 'f':
        case 'F':
        case 'j':
        case 'J':
          keys.punch = true;
          break;
        case 'x':
        case 'X':
        case 'k':
        case 'K':
          keys.shoot = true;
          break;
        case 'c':
        case 'C':
        case 'Shift':
        case 'l':
        case 'L':
          keys.swing = true;
          break;
        case 'v':
        case 'V':
          keys.symbiote = true;
          engine.activateSymbioteMode();
          break;
        case 'p':
        case 'P':
          if (gameState === 'PLAYING' || gameState === 'PAUSED') {
            handleTogglePause();
          }
          break;
        case 'm':
        case 'M':
          handleToggleMute();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const keys = engine.state.keys;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keys.right = false;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          keys.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          keys.down = false;
          break;
        case ' ':
          keys.jump = false;
          break;
        case 'z':
        case 'Z':
        case 'f':
        case 'F':
        case 'j':
        case 'J':
          keys.punch = false;
          break;
        case 'x':
        case 'X':
        case 'k':
        case 'K':
          keys.shoot = false;
          break;
        case 'c':
        case 'C':
        case 'Shift':
        case 'l':
        case 'L':
          keys.swing = false;
          break;
        case 'v':
        case 'V':
          keys.symbiote = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-red-600">
      {/* 1. Clear Dedication Banner for Leon Gabriel and Prima Evelyn */}
      <DedicationBanner onOpenMessage={() => setIsDedicationOpen(true)} />

      {/* 2. Top Bar Navigation Contract: [Brand wordmark] - [4 single-line links] - [1 action button] */}
      <header className="flex items-center justify-between gap-4 sm:gap-8 px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-900 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setGameState('TITLE')}
          className="text-sm sm:text-lg font-pixel text-red-500 hover:text-red-400 tracking-tight whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          HOMEM-ARANHA 8-BIT
        </button>

        {/* Zone 2: 4 single-line text links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
          <button
            onClick={() => handleStartGame(currentLevelIndex)}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Jogar
          </button>
          <button
            onClick={() => setIsLevelSelectOpen(true)}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Fases (11)
          </button>
          <button
            onClick={() => setIsControlsOpen(true)}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Comandos
          </button>
          <button
            onClick={() => setIsDedicationOpen(true)}
            className="text-rose-400 hover:text-rose-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Para Leon Gabriel
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleMute}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            title={isMuted ? 'Ativar som' : 'Desativar som'}
            aria-label="Controle de som"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {gameState === 'PLAYING' || gameState === 'PAUSED' ? (
            <button
              onClick={handleTogglePause}
              className="px-3.5 py-1.5 text-xs font-pixel text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {gameState === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{gameState === 'PAUSED' ? 'RETOMAR' : 'PAUSAR'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleStartGame(0)}
              className="px-4 py-2 text-xs font-pixel text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              INICIAR JOGO
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-1 sm:p-6 w-full max-w-6xl mx-auto">
        {gameState === 'TITLE' ? (
          <TitleScreen
            onStartGame={() => handleStartGame(0)}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
            onOpenControls={() => setIsControlsOpen(true)}
            onOpenDedication={() => setIsDedicationOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            showScanlines={showScanlines}
            onToggleScanlines={() => setShowScanlines(!showScanlines)}
          />
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Level Title & Controls Header Bar */}
            <div className="w-full max-w-5xl mb-2 flex items-center justify-between text-xs text-slate-400 px-2">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[11px] text-amber-400">
                  {GAME_LEVELS[currentLevelIndex].title}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline text-rose-300">
                  Chefe: {GAME_LEVELS[currentLevelIndex].boss.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsControlsOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Comandos
                </button>
                <button
                  onClick={() => setIsLevelSelectOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <List className="w-3.5 h-3.5" /> Fases
                </button>
                <button
                  onClick={() => setShowScanlines(!showScanlines)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  title="Alternar efeito retrô CRT"
                >
                  <Tv className="w-3.5 h-3.5 text-amber-400" /> CRT
                </button>
              </div>
            </div>

            {/* Game Canvas */}
            {engineRef.current && (
              <GameCanvas
                engine={engineRef.current}
                onGameStateChange={handleGameStateChange}
                showScanlines={showScanlines}
              />
            )}

            {/* Virtual Gamepad for Mobile & Tablet */}
            {engineRef.current && (
              <VirtualGamepad
                engine={engineRef.current}
                onTogglePause={handleTogglePause}
                onToggleMute={handleToggleMute}
                onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
                isPaused={gameState === 'PAUSED'}
                isMuted={isMuted}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-2.5 sm:py-4 px-3 sm:px-6 border-t border-slate-900 bg-slate-950/80 text-center text-[10px] sm:text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>Feito com carinho para o Leon Gabriel, da sua prima Evelyn</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>· 11 Fases Retrô 8-Bit</span>
        </p>
      </footer>

      {/* Modals */}
      <DedicationModal
        isOpen={isDedicationOpen}
        onClose={() => setIsDedicationOpen(false)}
      />

      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => setIsLevelSelectOpen(false)}
        onSelectLevel={(idx) => handleStartGame(idx)}
        unlockedLevels={unlockedLevels}
        currentLevelIndex={currentLevelIndex}
      />

      <ControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />

      {gameState === 'LEVEL_CLEAR' && (
        <LevelClearModal
          level={GAME_LEVELS[currentLevelIndex]}
          score={score}
          onNextLevel={handleNextLevel}
          onReplay={handleReplayLevel}
          hasNextLevel={currentLevelIndex < 10}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={score}
          onRetry={handleReplayLevel}
          onSelectLevel={() => setIsLevelSelectOpen(true)}
        />
      )}

      {gameState === 'VICTORY' && (
        <VictoryModal
          score={score}
          onRestartGame={() => handleStartGame(0)}
          onSelectLevel={() => setIsLevelSelectOpen(true)}
        />
      )}
    </div>
  );
}
