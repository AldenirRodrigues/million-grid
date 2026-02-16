
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { CanvasGrid } from './components/CanvasGrid';
import { Toolbar } from './components/Toolbar';
import { UploadModal } from './components/UploadModal';
import { TextModal } from './components/TextModal';
import { SelectionMenu } from './components/SelectionMenu';
import { HelpModal } from './components/HelpModal';
import { AboutModal } from './components/AboutModal';
import { PixPaymentModal } from './components/PixPaymentModal';
import { GridSelection, ToolType, GridItem, ViewportTransform, Point } from './types';
import { normalizeSelection } from './utils/math';
import { MAX_ZOOM, MIN_ZOOM, GRID_SIZE, CELL_SIZE, PRICE_PER_CELL } from './constants';
import { LayoutGrid, CheckCircle2, AlertCircle, Info, Plus, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [tool, setTool] = useState<ToolType>('select');
  const [items, setItems] = useState<GridItem[]>([]);
  const [pendingSelection, setPendingSelection] = useState<GridSelection | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Payment States
  const [showPixModal, setShowPixModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    id: string; // The ID returned from backend
    type: 'image' | 'text',
    data: any
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const viewTransformRef = useRef<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const [scaleDisplay, setScaleDisplay] = useState(1);

  useEffect(() => {
    const fetchPixels = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pixels`);
        if (!response.ok) throw new Error('Failed to fetch pixels');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error("API Error:", err);
        showToast('Erro ao carregar os dados do grid.', 'error');
      }
    };
    fetchPixels();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const totalCells = GRID_SIZE * GRID_SIZE;
  const occupiedCells = useMemo(() => {
    return items.reduce((acc, img) => acc + (img.w * img.h), 0);
  }, [items]);
  const remainingCells = totalCells - occupiedCells;

  const handleViewChange = useCallback(() => {
    setScaleDisplay(viewTransformRef.current.scale);
  }, []);

  const handleCursorMove = useCallback((point: Point) => {
    setCursorPos(point);
  }, []);

  const handleInteractionStart = useCallback(() => setIsInteracting(true), []);
  const handleInteractionEnd = useCallback(() => setIsInteracting(false), []);

  const handleSelectionComplete = useCallback((selection: GridSelection) => {
    setPendingSelection(selection);
  }, []);

  const handleSelectionConfirm = useCallback(() => {
    if (tool === 'select') setShowUploadModal(true);
    else if (tool === 'text') setShowTextModal(true);
  }, [tool]);

  const handleCancel = useCallback(() => {
    setPendingSelection(null);
    setShowUploadModal(false);
    setShowTextModal(false);
  }, []);

  const handleImageUpload = useCallback((url: string, link: string, framing: { zoom: number; offsetX: number; offsetY: number; rotation: number }) => {
    if (!pendingSelection) return;
    const { x, y, w, h } = normalizeSelection(pendingSelection.startX, pendingSelection.startY, pendingSelection.endX, pendingSelection.endY);

    const pixelData = {
      id: crypto.randomUUID(),
      type: 'image' as const,
      x, y, w, h,
      src: url,
      rotation: framing.rotation,
      brightness: 100,
      contrast: 100,
      zoom: framing.zoom,
      offsetX: framing.offsetX,
      offsetY: framing.offsetY,
      title: 'Pixel Publicado',
      link: link.trim() || null,
      createdAt: new Date().toISOString()
    };

    // Save as pending first
    savePendingPixel(pixelData);
    setShowUploadModal(false);
  }, [pendingSelection]);

  const handleTextUpload = useCallback((content: string, styles: any, metadata: any) => {
    if (!pendingSelection) return;
    const { x, y, w, h } = normalizeSelection(pendingSelection.startX, pendingSelection.startY, pendingSelection.endX, pendingSelection.endY);

    const pixelData = {
      id: crypto.randomUUID(),
      type: 'text' as const,
      x, y, w, h,
      content, ...styles,
      title: metadata.title,
      link: metadata.link.trim() || null,
      message: metadata.message.trim() || null,
      createdAt: new Date().toISOString()
    };

    // Save as pending first
    savePendingPixel(pixelData);
    setShowTextModal(false);
  }, [pendingSelection]);

  const savePendingPixel = async (pixelData: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pixels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pixelData)
      });

      if (!response.ok) throw new Error('Failed to save pixel');
      const savedPixel = await response.json();

      setPendingTransaction({
        id: savedPixel.id,
        type: pixelData.type,
        data: savedPixel
      });
      setShowPixModal(true);
    } catch (e) {
      console.error(e);
      showToast('Erro ao iniciar publicação no servidor.', 'error');
    }
  };

  const finalizePublication = async () => {
    // Webhook should handle the approval, we just close the modal and maybe refresh
    setShowPixModal(false);
    setPendingTransaction(null);
    setPendingSelection(null);
    showToast('Processando seu pagamento!', 'success');

    // Refresh pixels to show the newly approved one
    setTimeout(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pixels`);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000); // Wait a bit for the webhook to finish
  };

  const handleZoomIn = useCallback(() => {
    const vt = viewTransformRef.current;
    vt.scale = Math.min(MAX_ZOOM, vt.scale * 1.2);
    handleViewChange();
  }, [handleViewChange]);

  const handleZoomOut = useCallback(() => {
    const vt = viewTransformRef.current;
    vt.scale = Math.max(MIN_ZOOM, vt.scale / 1.2);
    handleViewChange();
  }, [handleViewChange]);

  const handleSetScale = useCallback((newScale: number) => {
    const vt = viewTransformRef.current;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const newX = cx - (cx - vt.x) * (newScale / vt.scale);
    const newY = cy - (cy - vt.y) * (newScale / vt.scale);
    viewTransformRef.current = { x: newX, y: newY, scale: newScale };
    handleViewChange();
  }, [handleViewChange]);

  const handleResetView = useCallback(() => {
    const scale = 1;
    const gridDim = GRID_SIZE * CELL_SIZE;
    const x = window.innerWidth / 2 - gridDim / 2;
    const y = window.innerHeight / 2 - gridDim / 2;
    viewTransformRef.current = { x, y, scale };
    handleViewChange();
  }, [handleViewChange]);

  const handleNavigateToItem = useCallback((item: GridItem) => {
    const minScreenDim = Math.min(window.innerWidth, window.innerHeight);
    const itemMaxDim = Math.max(item.w, item.h) * CELL_SIZE;
    let targetScale = (minScreenDim * 0.3) / itemMaxDim;
    targetScale = Math.max(2, Math.min(MAX_ZOOM, targetScale));
    const itemCX = (item.x + item.w / 2) * CELL_SIZE;
    const itemCY = (item.y + item.h / 2) * CELL_SIZE;
    const newX = window.innerWidth / 2 - (itemCX * targetScale);
    const newY = window.innerHeight / 2 - (itemCY * targetScale);
    viewTransformRef.current = { x: newX, y: newY, scale: targetScale };
    handleViewChange();
  }, [handleViewChange]);

  const handleViewItem = useCallback((item: GridItem) => {
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: 'Million Grid', text: 'Veja o grid!', url }); } catch (e) { } }
    else { await navigator.clipboard.writeText(url); showToast('Link copiado!'); }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <CanvasGrid
        tool={tool}
        uploads={items}
        activeSelection={pendingSelection}
        viewTransform={viewTransformRef}
        onSelectionComplete={handleSelectionComplete}
        onViewImage={handleViewItem}
        onCursorMove={handleCursorMove}
        onInteractionStart={handleInteractionStart}
        onInteractionEnd={handleInteractionEnd}
        forceUpdate={handleViewChange}
      />

      {/* Database Error Banner */}

      <div className="fixed top-6 left-8 z-30 select-none pointer-events-auto">
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter flex items-center">
          Meus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 ml-1">Pixels</span>
        </h1>
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 fade-in">
          <div className={`${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium`}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-green-400" />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/95 backdrop-blur-md shadow-lg border border-blue-100 rounded-full px-6 py-2 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-full text-white"><LayoutGrid size={18} /></div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-gray-900 font-bold uppercase mb-0.5">Disponíveis</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600 tabular-nums">
                {remainingCells.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs font-bold text-gray-900">pixels</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3 transition-transform ${isInteracting ? 'translate-y-48' : ''}`}>
        <div className={`flex items-center gap-2 transition-all ${isFabOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md">Sobre</span>
          <button onClick={() => { setShowAboutModal(true); setIsFabOpen(false); }} className="bg-white text-indigo-600 p-3 rounded-full shadow-lg border border-indigo-100"><Info size={24} /></button>
        </div>
        <div className={`flex items-center gap-2 transition-all ${isFabOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md">Ajuda</span>
          <button onClick={() => { setShowHelpModal(true); setIsFabOpen(false); }} className="bg-white text-blue-600 p-3 rounded-full shadow-lg border border-blue-100"><HelpCircle size={24} /></button>
        </div>
        <button onClick={() => setIsFabOpen(!isFabOpen)} className={`p-4 rounded-full shadow-xl transition-all ${isFabOpen ? 'bg-gray-800 text-white rotate-45' : 'bg-blue-600 text-white'}`}><Plus size={28} strokeWidth={2.5} /></button>
      </div>

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 transition-transform ${isInteracting ? 'translate-y-32' : ''}`}>
        <Toolbar currentTool={tool} setTool={setTool} scale={scaleDisplay} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetView={handleResetView} onSetScale={handleSetScale} onShare={handleShare} items={items} onNavigate={handleNavigateToItem} cursorPos={cursorPos} />
      </div>

      {pendingSelection && !showUploadModal && !showTextModal && !showPixModal && (
        <SelectionMenu selection={pendingSelection} onConfirm={handleSelectionConfirm} onCancel={handleCancel} />
      )}

      {showUploadModal && <UploadModal selection={pendingSelection} onClose={handleCancel} onUpload={handleImageUpload} />}
      {showTextModal && <TextModal selection={pendingSelection} onClose={handleCancel} onConfirm={handleTextUpload} />}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}

      {showPixModal && pendingTransaction && (
        <PixPaymentModal
          amount={(pendingTransaction.data.w * pendingTransaction.data.h) * PRICE_PER_CELL}
          pixelId={pendingTransaction.id}
          onClose={() => setShowPixModal(false)}
          onConfirm={finalizePublication}
        />
      )}
    </div>
  );
};

export default App;
