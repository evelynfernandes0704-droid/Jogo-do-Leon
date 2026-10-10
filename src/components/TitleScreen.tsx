/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, List, HelpCircle, Heart, Volume2, VolumeX, Tv } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenControls: () => void;
  onOpenDedication: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenControls,
  onOpenDedication,
  isMuted,
  onToggleMute,
  showScanlines,
  onToggleScanlines,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-red-700/80 p-6 sm:p-10 shadow-2xl overflow-hidden text-center">
      {/* Decorative spider web corners */}
      <div className="absolute top-2 left-2 text-slate-800 text-3xl select-none opacity-40">🕸️</div>
      <div className="absolute top-2 right-2 text-slate-800 text-3xl select-none opacity-40">🕸️</div>

      {/* Dedication Header Tag */}
      <div className="inline-flex items-center gap-2 bg-red-950/70 border border-red-600/60 px-4 py-1.5 rounded-full text-xs text-rose-300 font-medium mb-6 shadow-inner">
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
        <span>Feito com carinho para o <strong>Leon Gabriel</strong>, da prima <strong>Evelyn</strong></span>
      </div>

      {/* Main Retro Game Title */}
      <div className="space-y-2 mb-6">
        <div className="font-pixel text-xs sm:text-sm text-amber-400 tracking-widest">
          MARIO-STYLE 8-BIT PLATFORMER
        </div>
        <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-red-800 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          HOMEM-ARANHA
        </h1>
        <div className="font-pixel text-xs sm:text-sm text-sky-400">
          ★ EDIÇÃO ESPECIAL: LEON GABRIEL ★
        </div>
      </div>

      {/* Retro 8-bit Pixel Spidey Teaser Card */}
      <div className="bg-slate-950/80 border-2 border-slate-800 rounded-xl p-4 max-w-md mx-auto mb-8 shadow-inner">
        <div className="flex items-center justify-center gap-2 text-2xl mb-2">
          <span>🕷️</span>
          <span className="font-pixel text-xs text-slate-300">11 FASES · 11 SUPERVILÕES</span>
          <span>🏙️</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Salte entre os prédios de Nova York, balance nas teias e derrote o <strong>Duende Verde</strong>, <strong>Escorpião</strong>, <strong>Rino</strong>, <strong>Venom</strong> e muito mais!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-8">
        <button
          onClick={onStartGame}
          className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" /> JOGAR AGORA
        </button>

        <button
          onClick={onOpenLevelSelect}
          className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <List className="w-4 h-4" /> 11 FASES
        </button>
      </div>

      {/* Secondary Options */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800">
        <button
          onClick={onOpenControls}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Comandos & Teclas</span>
        </button>

        <button
          onClick={onOpenDedication}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Mensagem da Prima Evelyn</span>
        </button>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'Áudio: Desligado' : 'Áudio: Ligado'}</span>
        </button>

        <button
          onClick={onToggleScanlines}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          <Tv className="w-4 h-4 text-amber-400" />
          <span>{showScanlines ? 'Filtro CRT: Ligado' : 'Filtro CRT: Desligado'}</span>
        </button>
      </div>
    </div>
  );
};
