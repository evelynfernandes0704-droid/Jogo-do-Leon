/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Skull } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  onRetry: () => void;
  onSelectLevel: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  onRetry,
  onSelectLevel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs animate-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border-4 border-red-700 rounded-xl max-w-sm w-full p-6 text-center text-slate-100 shadow-2xl relative">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-950 border-2 border-red-700 flex items-center justify-center text-red-500">
          <Skull className="w-8 h-8" />
        </div>

        <h3 className="font-pixel text-lg text-red-500 mb-2">
          GAME OVER
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Não desista, Leon! O Aranha sempre se levanta!
        </p>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-5">
          <span className="text-xs text-slate-400 block mb-1">Pontuação Final:</span>
          <span className="font-pixel text-base text-amber-400">{score}</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> TENTAR DE NOVO
          </button>
          <button
            onClick={onSelectLevel}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] rounded-lg transition-colors cursor-pointer"
          >
            ESCOLHER OUTRA FASE
          </button>
        </div>
      </div>
    </div>
  );
};
