
import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Loader2, Maximize2, Move, RotateCcw } from 'lucide-react';
import { GridSelection } from '../types';
import { normalizeSelection } from '../utils/math';

interface UploadModalProps {
  selection: GridSelection | null;
  onClose: () => void;
  onUpload: (url: string, link: string, framing: { zoom: number; offsetX: number; offsetY: number; rotation: number }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ selection, onClose, onUpload }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [previewOk, setPreviewOk] = useState(false);

  // Framing States
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);

  if (!selection) return null;

  const { w, h } = normalizeSelection(selection.startX, selection.startY, selection.endX, selection.endY);
  const totalCells = w * h;
  const aspectRatio = w / h;

  useEffect(() => {
    if (!imageUrl) {
      setPreviewOk(false);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsValidating(true);
      const img = new Image();
      img.onload = () => {
        setPreviewOk(true);
        setError(null);
        setIsValidating(false);
      };
      img.onerror = () => {
        setPreviewOk(false);
        setError('Não foi possível carregar esta imagem. Verifique a URL ou permissões de CORS.');
        setIsValidating(false);
      };
      img.src = imageUrl;
    }, 500);

    return () => clearTimeout(timer);
  }, [imageUrl]);

  const handleSubmit = () => {
    if (!imageUrl || !previewOk) return;
    onUpload(imageUrl, link, { zoom, offsetX, offsetY, rotation });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] scale-100 transition-all">

        {/* Lado Esquerdo: Preview de Enquadramento */}
        <div className="w-full md:w-1/2 bg-gray-900 flex flex-col items-center justify-center p-8 relative">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest">
            <Maximize2 size={12} /> Viewport de Recorte ({w}x{h})
          </div>

          <div
            className="relative bg-black shadow-2xl overflow-hidden border border-white/10"
            style={{
              width: aspectRatio >= 1 ? '100%' : `${aspectRatio * 100}%`,
              aspectRatio: `${w}/${h}`,
              maxWidth: '300px'
            }}
          >
            {imageUrl && previewOk ? (
              <img
                src={imageUrl}
                alt="Framing Preview"
                className="absolute pointer-events-none transition-transform duration-75"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  // Ordem da transformação: Rotação -> Escala -> Translação
                  transform: `rotate(${rotation}deg) scale(${zoom}) translate(${offsetX / zoom}px, ${offsetY / zoom}px)`,
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                {isValidating ? <Loader2 className="animate-spin" /> : <ImageIcon size={48} />}
              </div>
            )}
          </div>

          <p className="mt-6 text-[10px] text-white/40 font-mono">Arraste os sliders para enquadrar</p>
        </div>

        {/* Lado Direito: Formulário e Controles */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-800 tracking-tight">Publicar Pixel</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Link da Imagem */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">URL da Imagem Pública</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/minha-arte.png"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-4 outline-none transition-all text-sm ${error ? 'border-red-200 focus:ring-red-50' : 'border-gray-100 focus:ring-blue-50'
                  }`}
              />
              {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
            </div>

            {/* Controles de Enquadramento */}
            <div className={`space-y-4 p-4 rounded-2xl bg-gray-50 transition-opacity ${previewOk ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Move size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-gray-700 uppercase">Ajuste de Enquadramento</span>
              </div>

              <div className="space-y-4">
                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span>ZOOM</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range" min="1" max="5" step="0.01"
                    value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Rotação */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span className="flex items-center gap-1"><RotateCcw size={10} /> ROTAÇÃO</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range" min="0" max="360" step="1"
                    value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Posição */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500">POSIÇÃO X</span>
                    <input
                      type="range" min="-100" max="100" step="1"
                      value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))}
                      className="w-full accent-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500">POSIÇÃO Y</span>
                    <input
                      type="range" min="-100" max="100" step="1"
                      value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))}
                      className="w-full accent-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Link Opcional</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://seu-site.com"
                className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="text-gray-400 text-[10px] font-bold">
              CUSTO: <span className="text-blue-600">R$ {totalCells},00</span>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
              <button
                onClick={handleSubmit}
                disabled={!imageUrl || !previewOk || isValidating}
                className={`px-8 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-200/50 ${!imageUrl || !previewOk || isValidating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'text-white bg-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
              >
                <Check size={16} strokeWidth={3} /> PUBLICAR AGORA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
