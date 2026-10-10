/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface LevelClearModalProps {
  level: LevelConfig;
  score: number;
  onNextLevel: () => void;
  onReplay: () => void;
  hasNextLevel: boolean;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  level,
  score,
  onNextLevel,
  onReplay,
  hasNextLevel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-xl max-w-md w-full p-6 text-center text-slate-100 shadow-2xl relative">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="font-pixel text-base text-amber-400 mb-1">
          FASE CONCLUÍDA!
        </h3>
        <p className="text-sm text-slate-300 font-semibold mb-2">
          {level.title}
        </p>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 my-4 text-left space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Vilão Derrotado:</span>
            <span className="text-emerald-400 font-bold">{level.boss.name}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Pontuação Total:</span>
            <span className="text-amber-400 font-pixel text-xs">{score}</span>
          </div>
          <div className="text-[11px] text-center text-rose-300 pt-1 font-medium">
            Muito bem, Leon! A prima Evelyn está orgulhosa!
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onReplay}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-[10px] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> REPETIR
          </button>

          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-pixel text-[10px] rounded-lg flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
            >
              PRÓXIMA FASE <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
