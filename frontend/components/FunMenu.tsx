import React, { useState } from 'react';
import { Smile, StickyNote, Image as ImageIcon, X } from 'lucide-react';
import { PresetMode } from '../types';

interface FunMenuProps {
  onSelectPreset: (preset: PresetMode) => void;
  onClose: () => void;
}

export const FunMenu: React.FC<FunMenuProps> = ({ onSelectPreset, onClose }) => {
  const presets: { label: string; icon: React.ReactNode; items: PresetMode[] }[] = [
    {
      label: 'Stickers',
      icon: <Smile size={18} />,
      items: [
        { type: 'text', content: '😎', style: { fontSize: 3 }, imageConfig: { title: 'Cool' } },
        { type: 'text', content: '🔥', style: { fontSize: 3 }, imageConfig: { title: 'Fire' } },
        { type: 'text', content: '❤️', style: { fontSize: 3 }, imageConfig: { title: 'Heart' } },
        { type: 'text', content: '🚀', style: { fontSize: 3 }, imageConfig: { title: 'Rocket' } },
        { type: 'text', content: '🎉', style: { fontSize: 3 }, imageConfig: { title: 'Party' } },
      ]
    },
    {
      label: 'Notas',
      icon: <StickyNote size={18} />,
      items: [
        { 
          type: 'text', 
          content: 'Lembrete!', 
          style: { 
            fontSize: 1, 
            bgColor: '#fef3c7', 
            color: '#78350f', 
            fontFamily: '"Comic Sans MS", cursive',
            fontWeight: 'bold'
          },
          imageConfig: { title: 'Nota Amarela' }
        },
        { 
          type: 'text', 
          content: 'Importante', 
          style: { 
            fontSize: 1, 
            bgColor: '#fee2e2', 
            color: '#991b1b', 
            fontFamily: '"Comic Sans MS", cursive',
            fontWeight: 'bold'
          },
          imageConfig: { title: 'Nota Vermelha' }
        },
        { 
          type: 'text', 
          content: 'Olá Mundo', 
          style: { 
            fontSize: 1, 
            bgColor: '#dbeafe', 
            color: '#1e40af', 
            fontFamily: '"Comic Sans MS", cursive',
            fontWeight: 'bold'
          },
          imageConfig: { title: 'Nota Azul' }
        },
      ]
    },
     {
      label: 'Imagens',
      icon: <ImageIcon size={18} />,
      items: [
        { 
          type: 'image', 
          content: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=200&fit=crop', 
          imageConfig: { title: 'Gatinho de Óculos' }
        },
        { 
          type: 'image', 
          content: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop', 
          imageConfig: { title: 'Cachorrinho' }
        },
      ]
    }
  ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-100 z-40 overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
           <span className="text-xl">✨</span> Modo Diversão
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        {presets.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === idx ? 'text-purple-600 bg-purple-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.icon}
            {cat.label}
            {activeTab === idx && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 h-48 overflow-y-auto custom-scrollbar bg-gray-50/30">
        <div className="grid grid-cols-3 gap-2">
          {presets[activeTab].items.map((item, i) => (
            <button
              key={i}
              onClick={() => onSelectPreset(item)}
              className="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all flex items-center justify-center p-2 group"
            >
              {item.type === 'text' ? (
                <div 
                  className="w-full h-full flex items-center justify-center rounded overflow-hidden text-center"
                  style={{ 
                    backgroundColor: item.style?.bgColor || 'transparent',
                    color: item.style?.color,
                    fontFamily: item.style?.fontFamily,
                  }}
                >
                  <span style={{ fontSize: item.style?.fontSize ? `${item.style.fontSize * 10}px` : '20px' }}>
                    {item.content}
                  </span>
                </div>
              ) : (
                <img 
                  src={item.content} 
                  alt="preset" 
                  className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform" 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};