/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, X, Award, Shield } from 'lucide-react';

interface DedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DedicationModal: React.FC<DedicationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-red-600 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Fechar mensagem"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-pixel text-xs sm:text-sm">
              MENSAGEM DA PRIMA EVELYN
            </h3>
            <p className="text-xs text-rose-400">Dedicado de coração para o Leon Gabriel</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <p className="font-semibold text-white">
            Querido primo Leon Gabriel,
          </p>
          <p>
            Este jogo retrô do Homem-Aranha foi desenvolvido especialmente para você! Inspirado nos clássicos de plataforma no estilo Mario Bros, mas com toda a emoção de saltar e balançar nas teias de aranha pelos arranha-céus de Nova York.
          </p>
          <p>
            Você terá que passar por <span className="text-amber-400 font-bold">11 fases cheias de ação</span> e enfrentar os maiores vilões: o perigoso <span className="text-emerald-400">Escorpião</span>, o poderoso <span className="text-slate-300">Rino</span>, o veloz <span className="text-emerald-400">Lagarto</span>, e até o terrível confronto final contra o <span className="text-purple-400 font-bold">Duende Verde</span>!
          </p>
          <p className="italic text-rose-300 font-medium">
            &ldquo;Com grandes poderes vêm grandes responsabilidades!&rdquo; Divirta-se muito salvando o dia, pequeno herói!
          </p>
          <p className="text-right text-xs text-amber-300 font-bold pt-2">
            Com muito carinho e amor, <br />
            da sua prima Evelyn ❤️
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded-lg transition-colors cursor-pointer"
          >
            VAMOS JOGAR!
          </button>
        </div>
      </div>
    </div>
  );
};
