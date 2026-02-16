import React, { useState, useMemo } from 'react';
import { MousePointer2, Move, ZoomIn, ZoomOut, Maximize, Type, Share2, Search, X, Image as ImageIcon, StickyNote, Crosshair } from 'lucide-react';
import { ToolType, GridItem, Point } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  setTool: (t: ToolType) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSetScale: (scale: number) => void;
  onShare: () => void;
  items: GridItem[];
  onNavigate: (item: GridItem) => void;
  cursorPos: Point;
}

const ToolbarComponent: React.FC<ToolbarProps> = ({ 
  currentTool, 
  setTool, 
  scale, 
  onZoomIn, 
  onZoomOut, 
  onResetView,
  onSetScale,
  onShare,
  items,
  onNavigate,
  cursorPos
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Limit to 10 results
  }, [items, searchQuery]);

  const handleItemClick = (item: GridItem) => {
    onNavigate(item);
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="relative flex flex-col items-center">
      
      {/* Search Popover */}
      {showSearch && (
        <div className="absolute bottom-full mb-4 w-80 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text"
              autoFocus
              placeholder="Buscar por nome ou apelido..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar bg-gray-50/50">
            {searchQuery && searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Nenhum resultado encontrado.
              </div>
            ) : (
              <div className="p-1">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-3 group border border-transparent hover:border-gray-100"
                  >
                    <div className={`p-1.5 rounded-md shrink-0 ${item.type === 'text' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.type === 'text' ? <StickyNote size={14} /> : <ImageIcon size={14} />}
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-gray-700 group-hover:text-blue-600 truncate">{item.title}</div>
                      <div className="text-[10px] text-gray-400 truncate">
                         x:{item.x}, y:{item.y}
                      </div>
                    </div>
                  </button>
                ))}
                {!searchQuery && (
                  <div className="p-3 text-center text-xs text-gray-400">
                    Digite para procurar...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 rounded-full px-4 py-2 flex items-center gap-4">
        
        {/* Search Toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`p-2 rounded-full transition-all ${
            showSearch 
              ? 'bg-blue-50 text-blue-600 shadow-inner ring-1 ring-blue-100' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          title="Buscar (Nome ou Apelido)"
        >
          <Search size={20} />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        {/* Tools */}
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded-full transition-all ${
              currentTool === 'select' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Seleção de Imagem (Clique esquerdo)"
          >
            <MousePointer2 size={20} />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-full transition-all ${
              currentTool === 'text' 
                ? 'bg-white shadow-sm text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Ferramenta de Texto"
          >
            <Type size={20} />
          </button>
          <button
            onClick={() => setTool('pan')}
            className={`p-2 rounded-full transition-all ${
              currentTool === 'pan' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Navegar (Espaço+Clique / Clique direito)"
          >
            <Move size={20} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Coordinates Display */}
        <div className="flex items-center gap-2 text-gray-500 font-mono text-xs w-24 shrink-0 justify-center" title="Coordenadas (X, Y)">
          <Crosshair size={16} className="text-gray-400" />
          <div className="flex gap-1.5">
            <span>{cursorPos.x}</span>
            <span className="text-gray-300">x</span>
            <span>{cursorPos.y}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onZoomOut}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="w-12 text-center text-xs font-mono font-medium text-gray-600">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={onZoomIn}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />
        
        <button 
          onClick={onResetView}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Resetar Visão"
        >
          <Maximize size={18} />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button 
          onClick={onShare}
          className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
          title="Compartilhar Link"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export const Toolbar = React.memo(ToolbarComponent);