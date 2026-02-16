import React from 'react';
import { X, Globe, Zap, Users, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe size={120} />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={20} />
          </button>
          <h2 className="text-3xl font-black text-white tracking-tight relative z-10">Meus Pixels</h2>
          <p className="text-blue-100 mt-2 text-sm font-medium relative z-10">Um experimento de arte colaborativa global.</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
          <div className="prose prose-sm text-gray-600 leading-relaxed mb-6">
            <p className="text-base">
              Bem-vindo ao <strong>Meus Pixels</strong>. Este é um tabuleiro infinito de 1000x1000 pixels onde cada espaço é um pedaço imutável da história da internet.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="bg-blue-100 p-2 rounded-md text-blue-600 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Colaborativo</h3>
                <p className="text-xs text-gray-600 mt-1">Um espaço compartilhado onde artistas, marcas e criadores coexistem em um único tabuleiro gigante.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="bg-purple-100 p-2 rounded-md text-purple-600 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Interativo</h3>
                <p className="text-xs text-gray-600 mt-1">Cada pixel pode conter imagens, textos, links e mensagens ocultas que são reveladas ao explorar.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="bg-green-100 p-2 rounded-md text-green-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Eterno</h3>
                <p className="text-xs text-gray-600 mt-1">Uma vez publicado, seu espaço é garantido. Faça parte desta obra de arte em constante evolução.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center text-xs text-gray-400 font-medium uppercase tracking-wider">
           © 2024 Meus Pixels Project
        </div>
      </div>
    </div>
  );
};