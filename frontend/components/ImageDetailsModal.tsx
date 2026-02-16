import React, { useState } from 'react';
import { X, ExternalLink, MessageSquare, Tag, ZoomIn, Type } from 'lucide-react';
import { GridItem, GridText, UploadedImage } from '../types';

interface ImageDetailsModalProps {
  image: GridItem;
  onClose: () => void;
}

export const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({ image, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isText = image.type === 'text';
  const textItem = image as GridText;
  const imgItem = image as UploadedImage;

  return (
    <>
      {/* Expanded Fullscreen View (Images Only) */}
      {isExpanded && !isText && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setIsExpanded(false)}
        >
          <button 
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={32} />
          </button>
          
          <img 
            src={imgItem.src} 
            alt={imgItem.title} 
            className="max-w-full max-h-full object-contain shadow-2xl"
            style={{
                filter: `brightness(${imgItem.brightness}%) contrast(${imgItem.contrast}%)`
            }}
          />
        </div>
      )}

      {/* Normal Details Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] scale-100 transform transition-all">
          
          {/* Header */}
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Tag size={18} className="text-blue-600" />
              {image.title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-0 overflow-y-auto custom-scrollbar">
            
            {/* Visual Display */}
            <div className="w-full bg-gray-100 border-b border-gray-200 flex items-center justify-center p-4">
               {isText ? (
                  <div 
                    className="flex items-center justify-center text-center shadow-sm p-4 w-full h-64 overflow-hidden"
                    style={{
                        backgroundColor: textItem.bgColor,
                    }}
                  >
                     <p style={{
                         fontFamily: textItem.fontFamily,
                         color: textItem.color,
                         fontWeight: textItem.fontWeight,
                         fontSize: '24px',
                         lineHeight: 1.4
                     }}>
                        {textItem.content}
                     </p>
                  </div>
               ) : (
                 <div 
                    className="relative overflow-hidden shadow-sm group cursor-zoom-in transition-transform hover:scale-[1.02] duration-200"
                    onClick={() => setIsExpanded(true)}
                    style={{
                        width: `${image.w * 20}px`, // Approximate visual scale
                        maxWidth: '100%',
                        maxHeight: '400px',
                        aspectRatio: `${image.w}/${image.h}`
                    }}
                 >
                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center z-10 pointer-events-none">
                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity duration-200" size={32} />
                    </div>

                    <img 
                        src={imgItem.src} 
                        alt={imgItem.title} 
                        className="w-full h-full object-contain"
                        style={{
                            filter: `brightness(${imgItem.brightness}%) contrast(${imgItem.contrast}%)`
                        }}
                    />
                 </div>
               )}
            </div>

            <div className="p-6 space-y-6">
              
              {isText && (
                  <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                      <Type size={14} className="mt-0.5" />
                      <span>Conteúdo de texto formatado</span>
                  </div>
              )}

              {/* Message Section */}
              {image.message && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-start gap-3">
                          <MessageSquare className="text-blue-500 mt-1 shrink-0" size={18} />
                          <div>
                              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Mensagem</p>
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{image.message}</p>
                          </div>
                      </div>
                  </div>
              )}

              {/* Link Section */}
              {image.link && (
                  <div className="pt-2">
                      <a 
                          href={image.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium group"
                      >
                          <ExternalLink size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                          Visitar Site
                      </a>
                      <p className="text-center text-xs text-gray-400 mt-2 truncate px-4">{image.link}</p>
                  </div>
              )}
              
              {!image.link && !image.message && (
                  <p className="text-center text-gray-500 italic text-sm">Sem informações adicionais.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
