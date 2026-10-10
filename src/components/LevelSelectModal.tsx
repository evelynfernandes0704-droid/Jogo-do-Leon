/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GAME_LEVELS } from '../game/levels';
import { X, Lock, CheckCircle2, Play } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (levelIndex: number) => void;
  unlockedLevels: number[];
  currentLevelIndex: number;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  unlockedLevels,
  currentLevelIndex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-red-600 rounded-xl max-w-3xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-pixel text-xs sm:text-sm text-red-500">
              SELEÇÃO DE FASES (1 A 11)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Escolha a missão do Homem-Aranha para o Leon Gabriel
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 11 Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4 overflow-y-auto pr-1">
          {GAME_LEVELS.map((lvl, index) => {
            const isUnlocked = unlockedLevels.includes(lvl.id);
            const isCurrent = currentLevelIndex === index;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(index);
                    onClose();
                  }
                }}
                className={`p-3 rounded-lg border transition-all text-left relative flex flex-col justify-between ${
                  isCurrent
                    ? 'border-red-500 bg-red-950/40 shadow-md ring-1 ring-red-500'
                    : isUnlocked
                    ? 'border-slate-800 bg-slate-950/80 hover:border-slate-600 cursor-pointer hover:bg-slate-800/60'
                    : 'border-slate-900 bg-slate-950/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-pixel text-[10px] text-amber-400">
                      FASE {lvl.id}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Aberta
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Bloqueada
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {lvl.areaName}
                  </h4>
                  <p className="text-[11px] text-rose-300 font-medium mt-1">
                    Vilão: {lvl.boss.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {lvl.description}
                  </p>
                </div>

                {isUnlocked && (
                  <button
                    type="button"
                    className="mt-3 w-full py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-pixel text-[9px] rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-white" /> JOGAR
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Progresso salvo automaticamente</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
