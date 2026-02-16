import React from 'react';
import { RotateCw, Sun, Contrast, Trash2, X } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageEditorProps {
  image: UploadedImage | null;
  onUpdate: (updates: Partial<UploadedImage>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onUpdate, onDelete, onClose }) => {
  if (!image) return null;

  const handleRotate = () => {
    // Increment rotation by 90 degrees
    // We do NOT swap dimensions anymore, so the image rotates INSIDE its existing grid box
    const newRotation = (image.rotation + 90) % 360;
    
    onUpdate({
      rotation: newRotation
    });
  };

  return (
    <div className="fixed top-20 right-4 w-72 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200 z-40 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 text-sm">Editar Imagem</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1"><Sun size={14} /> Brilho</span>
            <span>{image.brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={image.brightness}
            onChange={(e) => onUpdate({ brightness: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1"><Contrast size={14} /> Contraste</span>
            <span>{image.contrast}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={image.contrast}
            onChange={(e) => onUpdate({ contrast: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="h-px bg-gray-100" />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRotate}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-sm font-medium"
          >
            <RotateCw size={16} />
            Girar
          </button>
          
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all text-sm font-medium"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};