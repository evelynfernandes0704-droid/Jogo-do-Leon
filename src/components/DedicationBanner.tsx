/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Sparkles, User } from 'lucide-react';

interface DedicationBannerProps {
  onOpenMessage: () => void;
}

export const DedicationBanner: React.FC<DedicationBannerProps> = ({ onOpenMessage }) => {
  return (
    <div className="w-full bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-900/60 px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
      <span className="text-slate-200">
        Feito com muito carinho para o <strong className="text-amber-400 font-bold">Leon Gabriel</strong>, da sua prima <strong className="text-rose-400 font-bold">Evelyn</strong>
      </span>
      <span className="hidden sm:inline text-slate-500">·</span>
      <button
        onClick={onOpenMessage}
        className="text-xs text-rose-300 hover:text-white underline underline-offset-2 ml-1 cursor-pointer transition-colors"
      >
        Ler mensagem especial
      </button>
      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 hidden sm:inline" />
    </div>
  );
};
