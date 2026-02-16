import React from 'react';
import { Check, X, DollarSign } from 'lucide-react';
import { GridSelection } from '../types';
import { normalizeSelection } from '../utils/math';
import { PRICE_PER_CELL } from '../constants';

interface SelectionMenuProps {
  selection: GridSelection;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SelectionMenu: React.FC<SelectionMenuProps> = ({ selection, onConfirm, onCancel }) => {
  const { w, h } = normalizeSelection(selection.startX, selection.startY, selection.endX, selection.endY);
  const totalCells = w * h;
  const price = totalCells * PRICE_PER_CELL;
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 rounded-lg p-2 flex items-center gap-4 z-40 animate-in fade-in slide-in-from-top-4">
      <div className="flex flex-col px-2">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Área Selecionada</div>
        <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
           {w} x {h} <span className="text-gray-400 font-normal">({totalCells} pixels)</span>
        </div>
      </div>
      
      <div className="h-8 w-px bg-gray-300" />

      <div className="flex flex-col px-2 min-w-[80px]">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">TOTAL</div>
        <div className="text-sm font-bold text-green-600">
           {formattedPrice}
        </div>
      </div>

      <div className="h-8 w-px bg-gray-300" />

      <div className="flex gap-1">
        <button 
          onClick={onCancel}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
          title="Cancelar"
        >
          <X size={20} />
        </button>
        <button 
          onClick={onConfirm}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
        >
          <Check size={18} /> Confirmar
        </button>
      </div>
    </div>
  );
};