import React, { useState } from 'react';
import { X, Type, Palette, AlignLeft, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { GridSelection } from '../types';
import { normalizeSelection } from '../utils/math';

interface TextModalProps {
  selection: GridSelection | null;
  onClose: () => void;
  onConfirm: (
    content: string, 
    styles: { fontFamily: string; fontSize: number; color: string; bgColor: string; fontWeight: string },
    metadata: { title: string; link: string; message: string }
  ) => void;
}

const FONTS = [
  { name: 'Sans Serif', value: 'sans-serif' },
  { name: 'Serif', value: 'serif' },
  { name: 'Monospace', value: 'monospace' },
  { name: 'Cursive', value: 'cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
];

export const TextModal: React.FC<TextModalProps> = ({ selection, onClose, onConfirm }) => {
  // Text Content & Style
  const [content, setContent] = useState('');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontSize, setFontSize] = useState(1);
  const [fontWeight, setFontWeight] = useState('bold');
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  // Metadata
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');

  if (!selection) return null;

  const { w, h } = normalizeSelection(selection.startX, selection.startY, selection.endX, selection.endY);

  const handleConfirm = () => {
    if (!content.trim() || !title.trim()) return;
    onConfirm(
      content,
      { fontFamily, fontSize, color, bgColor, fontWeight },
      { title, link, message }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Preview */}
        <div className="w-full md:w-1/2 bg-gray-100 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 w-full text-center">Preview</h3>
           
           <div 
             className="relative shadow-lg flex items-center justify-center text-center overflow-hidden p-4 transition-all duration-300"
             style={{
               width: `${Math.min(300, w * 40)}px`,
               height: `${Math.min(300, h * 40)}px`,
               backgroundColor: bgColor,
               aspectRatio: `${w}/${h}`
             }}
           >
             <p style={{ 
               fontFamily, 
               color, 
               fontWeight,
               fontSize: `${fontSize * 20}px`, // Scaled for preview
               lineHeight: 1.2,
               wordBreak: 'break-word'
             }}>
               {content || 'Seu texto aqui'}
             </p>
           </div>
           
           <p className="mt-4 text-xs text-gray-400">Área ocupada: {w}x{h} pixels</p>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Type size={20} className="text-purple-600" />
              Criar Texto
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Main Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo do Texto <span className="text-red-500">*</span></label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva algo..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none text-lg"
                  maxLength={100}
                />
              </div>

              {/* Styling Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fonte</label>
                  <select 
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  >
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">Tamanho</label>
                   <input 
                     type="range" 
                     min="0.5" 
                     max="3" 
                     step="0.1" 
                     value={fontSize}
                     onChange={(e) => setFontSize(parseFloat(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2"
                   />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cor do Texto</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs text-gray-500 font-mono">{color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fundo</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs text-gray-500 font-mono">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Metadata */}
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Identificação <span className="text-red-500">*</span></label>
                 <input
                   type="text"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder="Título do pixel"
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                 />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><LinkIcon size={12}/> Link (Opcional)</label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><MessageSquare size={12}/> Mensagem (Opcional)</label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hover message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                  </div>
               </div>
            </div>

          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!content.trim() || !title.trim()}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${
                !content.trim() || !title.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'text-white bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};