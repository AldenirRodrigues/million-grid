import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export const Instructions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full shadow-md text-gray-600 hover:text-blue-600 transition-colors z-40"
      >
        <Keyboard size={20} />
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-64 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200 z-40 overflow-hidden text-sm">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Keyboard size={16} /> Atalhos
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-2 text-gray-600">
        <div className="flex justify-between">
          <span>Seleção</span>
          <span className="font-mono bg-gray-100 px-1 rounded text-xs border border-gray-200">Clique Esq.</span>
        </div>
        <div className="flex justify-between">
          <span>Forçar Seleção</span>
          <span className="font-mono bg-gray-100 px-1 rounded text-xs border border-gray-200">Ctrl + Click</span>
        </div>
        <div className="flex justify-between">
          <span>Navegar (Pan)</span>
          <span className="font-mono bg-gray-100 px-1 rounded text-xs border border-gray-200">Espaço + Click</span>
        </div>
        <div className="flex justify-between">
          <span>Navegar (Alt)</span>
          <span className="font-mono bg-gray-100 px-1 rounded text-xs border border-gray-200">Botão Direito</span>
        </div>
        <div className="flex justify-between">
          <span>Zoom</span>
          <span className="font-mono bg-gray-100 px-1 rounded text-xs border border-gray-200">Roda do Mouse</span>
        </div>
      </div>
    </div>
  );
};