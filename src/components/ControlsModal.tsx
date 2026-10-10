/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Gamepad2 } from 'lucide-react';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-red-600 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 className="w-6 h-6 text-red-500" />
          <h3 className="font-pixel text-xs sm:text-sm text-white">
            COMO JOGAR & COMANDOS
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400 font-pixel text-[10px]">
              TECLADO (COMPUTADOR)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1">← →</span>
                ou <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">A / D</span>: Andar
              </div>
              <div>
                <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1">Espaço</span>
                : Pular
              </div>
              <div>
                <span className="text-amber-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1">Z</span>
                ou <span className="text-amber-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">F</span>: <strong>Dar Soco 🥊</strong>
              </div>
              <div>
                <span className="text-red-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1">X</span>
                : <strong>Atirar Teia 🕸️</strong>
              </div>
              <div>
                <span className="text-sky-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1">C</span>
                ou <span className="text-sky-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">Shift</span>: Balançar na Teia
              </div>
              <div>
                <span className="text-purple-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1">V</span>
                : <strong>Modo Venom 🧬 (Fase 6+)</strong>
              </div>
              <div>
                <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1">P</span>
                : Pausar jogo
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-sky-400 font-pixel text-[10px]">
              HABILIDADES & COMBOS DO ARANHA
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-300">
              <li>
                <strong className="text-red-400">Prender Inimigos na Teia & Cooldown de 5s:</strong> Ao atirar teia (<strong className="text-white">X</strong>) e prender o vilão no casulo, você ganha uma pausa tática de <span className="text-amber-300 font-bold">5 segundos de recarga</span> para lançar teia de novo!
              </li>
              <li>
                <strong className="text-purple-400">★ Modo Homem-Aranha Venom (Fase 6+):</strong> A partir da Fase 6, pressione <strong className="text-purple-300">V</strong> (ou botão <strong className="text-purple-300">VENOM</strong>) para ativar o traje preto com a simbiose a cada 40 segundos, durando 20 segundos!
              </li>
              <li>
                <strong className="text-purple-300">Poder do Braço de Simbiose:</strong> No modo Venom, o botão de teia vira o poder de <span className="text-purple-200 font-bold">esticar o braço com a simbiose, agarrar o vilão e puxá-lo para perto</span> para acertar socos devastadores!
              </li>
              <li>
                <strong className="text-amber-400">Soco & Super Combo:</strong> Dê socos (<strong className="text-white">Z</strong> ou <strong className="text-white">F</strong>) para nocautear inimigos. Ao socar um inimigo preso, a teia/simbiose é estilhaçada com <span className="text-amber-300 font-bold">Dano Extra e Bônus de Combo</span>.
              </li>
              <li>
                <strong className="text-sky-400">Balanço de Teia:</strong> Pressione <strong className="text-sky-300">C</strong> perto dos prédios para disparar a teia e balançar como um pêndulo. Solte a tecla no pico do arco para ser lançado em alta velocidade!
              </li>
              <li>
                <strong className="text-yellow-400">★ Regra para Passar de Fase:</strong> O mastro de saída só é liberado quando você <span className="text-amber-300 font-bold">derrotar todos os inimigos</span> OU <span className="text-amber-300 font-bold">pegar todos os pontos</span> da fase!
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded-lg transition-colors cursor-pointer"
          >
            ENTENDI!
          </button>
        </div>
      </div>
    </div>
  );
};
