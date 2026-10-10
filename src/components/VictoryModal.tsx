/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Heart, Sparkles, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  score: number;
  onRestartGame: () => void;
  onSelectLevel: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  onRestartGame,
  onSelectLevel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-2xl max-w-lg w-full p-6 text-center text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Confetti sparkle icon */}
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300">
          <Award className="w-10 h-10" />
        </div>

        <h2 className="font-pixel text-base sm:text-lg text-amber-400 mb-2">
          VITÓRIA HEROICA!
        </h2>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
          PARABÉNS, LEON GABRIEL!
        </h3>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 my-4 text-sm text-slate-300 space-y-2">
          <p className="leading-relaxed">
            Você completou todas as <strong className="text-amber-400">11 fases</strong> do jogo e derrotou o infame <strong className="text-emerald-400">Duende Verde</strong> e todos os vilões de Nova York!
          </p>
          <div className="py-2 border-y border-slate-800/80 my-2">
            <span className="text-xs text-slate-400 block">Pontuação Suprema:</span>
            <span className="font-pixel text-lg text-amber-300">{score} PONTOS</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-semibold pt-1">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Feito com todo o carinho do mundo pela sua prima Evelyn!</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={onRestartGame}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> JOGAR NOVAMENTE
          </button>
          <button
            onClick={onSelectLevel}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-xl transition-colors cursor-pointer"
          >
            ESCOLHER FASE
          </button>
        </div>
      </div>
    </div>
  );
};
