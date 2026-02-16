
import React, { useRef, useEffect, useCallback } from 'react';
import { GRID_SIZE, CELL_SIZE, MAX_ZOOM, MIN_ZOOM } from '../constants';
import { Point, ViewportTransform, GridSelection, ToolType, GridItem, UploadedImage, GridText } from '../types';
import { screenToGrid } from '../utils/math';

interface CanvasGridProps {
  tool: ToolType;
  uploads: GridItem[];
  activeSelection: GridSelection | null;
  viewTransform: React.MutableRefObject<ViewportTransform>;
  onSelectionComplete: (selection: GridSelection) => void;
  onViewImage: (image: GridItem) => void;
  onCursorMove: (point: Point) => void;
  forceUpdate: () => void;
}

const CanvasGridComponent: React.FC<CanvasGridProps> = ({ 
  tool, 
  uploads,
  activeSelection,
  viewTransform, 
  onSelectionComplete,
  onViewImage,
  onCursorMove,
  forceUpdate 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const uploadsRef = useRef(uploads);
  const toolRef = useRef(tool);
  const activeSelectionRef = useRef(activeSelection);
  const onSelectionCompleteRef = useRef(onSelectionComplete);
  const onViewImageRef = useRef(onViewImage);
  const onCursorMoveRef = useRef(onCursorMove);
  const forceUpdateRef = useRef(forceUpdate);
  const lastReportedGridPos = useRef<Point>({ x: -1, y: -1 });

  useEffect(() => { uploadsRef.current = uploads; }, [uploads]);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { activeSelectionRef.current = activeSelection; }, [activeSelection]);
  useEffect(() => { onSelectionCompleteRef.current = onSelectionComplete; }, [onSelectionComplete]);
  useEffect(() => { onViewImageRef.current = onViewImage; }, [onViewImage]);
  useEffect(() => { onCursorMoveRef.current = onCursorMove; }, [onCursorMove]);
  useEffect(() => { forceUpdateRef.current = forceUpdate; }, [forceUpdate]);

  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 }); 
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  const isSpacePressed = useRef(false);
  const dragSelection = useRef<GridSelection | null>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  
  const hoveredImageRef = useRef<GridItem | null>(null);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) currentLine += " " + word;
        else { lines.push(currentLine); currentLine = word; }
    }
    lines.push(currentLine);
    return lines;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { width, height } = canvas;
    const { x: offsetX, y: offsetY, scale } = viewTransform.current;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const BUFFER = 5; 
    const startCol = Math.max(0, Math.floor(-offsetX / scale / CELL_SIZE) - BUFFER);
    const endCol = Math.min(GRID_SIZE, Math.ceil((width - offsetX) / scale / CELL_SIZE) + BUFFER);
    const startRow = Math.max(0, Math.floor(-offsetY / scale / CELL_SIZE) - BUFFER);
    const endRow = Math.min(GRID_SIZE, Math.ceil((height - offsetY) / scale / CELL_SIZE) + BUFFER);

    ctx.lineWidth = 1 / scale;
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    for (let i = Math.max(0, startCol - 1); i <= Math.min(GRID_SIZE, endCol + 1); i++) {
      const x = i * CELL_SIZE;
      ctx.moveTo(x, startRow * CELL_SIZE);
      ctx.lineTo(x, endRow * CELL_SIZE);
    }
    for (let i = Math.max(0, startRow - 1); i <= Math.min(GRID_SIZE, endRow + 1); i++) {
      const y = i * CELL_SIZE;
      ctx.moveTo(startCol * CELL_SIZE, y);
      ctx.lineTo(endCol * CELL_SIZE, y);
    }
    ctx.stroke();

    const currentItems = uploadsRef.current;
    for (let i = 0; i < currentItems.length; i++) {
      const item = currentItems[i];
      if (item.x + item.w < startCol || item.x > endCol || item.y + item.h < startRow || item.y > endRow) continue;

      const boxX = item.x * CELL_SIZE;
      const boxY = item.y * CELL_SIZE;
      const boxW = item.w * CELL_SIZE;
      const boxH = item.h * CELL_SIZE;

      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      if (item.type === 'image') {
          const img = item as UploadedImage;
          let cached = imageCache.current.get(img.id);
          if (!cached) {
            cached = new Image();
            cached.src = img.src;
            cached.onload = () => {
              if (requestRef.current === null) {
                requestRef.current = requestAnimationFrame(() => { draw(); requestRef.current = null; });
              }
            };
            imageCache.current.set(img.id, cached);
          }

          if (cached.complete && cached.naturalWidth > 0) {
            const cx = boxX + boxW / 2;
            const cy = boxY + boxH / 2;
            ctx.translate(cx, cy);
            ctx.rotate((img.rotation * Math.PI) / 180);
            ctx.filter = `brightness(${img.brightness}%) contrast(${img.contrast}%)`;
            
            // Apply Framing: Zoom and Offset
            const z = img.zoom || 1;
            const ox = (img.offsetX || 0) * (CELL_SIZE / 20); // Normalize offset if CELL_SIZE changes
            const oy = (img.offsetY || 0) * (CELL_SIZE / 20);
            
            ctx.drawImage(cached, (-boxW / 2) * z + ox, (-boxH / 2) * z + oy, boxW * z, boxH * z);
          }
      } else if (item.type === 'text') {
          const txt = item as GridText;
          ctx.fillStyle = txt.bgColor;
          ctx.fillRect(boxX, boxY, boxW, boxH);
          const fontSize = txt.fontSize * CELL_SIZE;
          ctx.font = `${txt.fontWeight} ${fontSize}px ${txt.fontFamily}`;
          ctx.fillStyle = txt.color;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          const lines = wrapText(ctx, txt.content, boxW - 4);
          const lineHeight = fontSize * 1.2;
          let startY = boxY + (boxH - lines.length * lineHeight) / 2 + lineHeight / 2;
          for (let line of lines) { ctx.fillText(line, boxX + boxW / 2, startY); startY += lineHeight; }
      }
      ctx.restore();
    }

    const sel = isDragging.current ? dragSelection.current : activeSelectionRef.current;
    if (sel) {
      const { startX, startY, endX, endY } = sel;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const w = Math.abs(endX - startX) + 1;
      const h = Math.abs(endY - startY) + 1;
      const isTextTool = toolRef.current === 'text';
      ctx.fillStyle = isTextTool ? 'rgba(147, 51, 234, 0.2)' : 'rgba(59, 130, 246, 0.2)';
      ctx.strokeStyle = isTextTool ? '#9333ea' : '#2563eb';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, w * CELL_SIZE, h * CELL_SIZE);
      ctx.lineWidth = 2 / scale;
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, w * CELL_SIZE, h * CELL_SIZE);
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4 / scale;
    ctx.strokeRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    ctx.restore();

    if (hoveredImageRef.current && hoveredImageRef.current.link && !isDragging.current) {
        const linkText = hoveredImageRef.current.link;
        ctx.font = 'bold 11px sans-serif';
        const textMetrics = ctx.measureText(linkText);
        const padding = 8;
        const bW = textMetrics.width + padding * 2;
        const bH = 24;
        const mx = lastMousePos.current.x;
        const my = lastMousePos.current.y;
        let tx = mx + 15; let ty = my + 15;
        if (tx + bW > width) tx = mx - bW - 10;
        if (ty + bH > height) ty = my - bH - 10;
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath(); ctx.roundRect(tx, ty, bW, bH, 6); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle';
        ctx.fillText(linkText, tx + padding, ty + bH / 2);
    }
  }, [viewTransform]);

  const scheduleDraw = useCallback(() => {
    if (requestRef.current) return;
    requestRef.current = requestAnimationFrame(() => { draw(); requestRef.current = null; });
  }, [draw]);

  const updateCursor = useCallback(() => {
    if (isDragging.current) { document.body.style.cursor = isPanning.current ? 'grabbing' : 'crosshair'; return; }
    const currentTool = toolRef.current;
    if (isSpacePressed.current || currentTool === 'pan') { document.body.style.cursor = 'grab'; }
    else if (hoveredImageRef.current) { document.body.style.cursor = 'pointer'; }
    else { document.body.style.cursor = currentTool === 'text' ? 'text' : 'default'; }
  }, []);

  useEffect(() => updateCursor(), [tool, updateCursor]);
  useEffect(() => { scheduleDraw(); }, [uploads, scheduleDraw]);
  useEffect(() => { dragSelection.current = null; scheduleDraw(); }, [tool, scheduleDraw]);
  useEffect(() => scheduleDraw(), [activeSelection, scheduleDraw]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        scheduleDraw();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [scheduleDraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const getHoveredItem = (gx: number, gy: number): GridItem | null => {
        const currentItems = uploadsRef.current;
        for (let i = currentItems.length - 1; i >= 0; i--) {
            const item = currentItems[i];
            if (gx >= item.x && gx < item.x + item.w && gy >= item.y && gy < item.y + item.h) return item;
        }
        return null;
    };
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const isRightClick = e.button === 2; const isMiddleClick = e.button === 1;
      const isCtrl = e.ctrlKey || e.metaKey; const currentTool = toolRef.current;
      let mode = 'idle';
      if (isSpacePressed.current || isRightClick || isMiddleClick || (currentTool === 'pan' && !isCtrl)) mode = 'panning';
      else mode = 'selecting';
      const gridPos = screenToGrid(e.clientX, e.clientY, viewTransform.current);
      if (mode === 'selecting') {
          const clickedItem = getHoveredItem(gridPos.x, gridPos.y);
          if (clickedItem) { onViewImageRef.current(clickedItem); return; }
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      dragStart.current = { x: e.clientX, y: e.clientY };
      isPanning.current = (mode === 'panning');
      isDragging.current = true;
      updateCursor();
      if (mode === 'selecting') {
         if (gridPos.x >= 0 && gridPos.x < GRID_SIZE && gridPos.y >= 0 && gridPos.y < GRID_SIZE) {
           dragSelection.current = { startX: gridPos.x, startY: gridPos.y, endX: gridPos.x, endY: gridPos.y };
           scheduleDraw();
         }
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMousePos.current.x; const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      const gridPos = screenToGrid(e.clientX, e.clientY, viewTransform.current);
      const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, gridPos.x));
      const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, gridPos.y));
      if (clampedX !== lastReportedGridPos.current.x || clampedY !== lastReportedGridPos.current.y) {
         lastReportedGridPos.current = { x: clampedX, y: clampedY };
         onCursorMoveRef.current({ x: clampedX, y: clampedY });
      }
      if (!isDragging.current) {
        const hovered = getHoveredItem(gridPos.x, gridPos.y);
        if (hovered !== hoveredImageRef.current) { hoveredImageRef.current = hovered; updateCursor(); scheduleDraw(); }
        else if (hovered && hovered.link) scheduleDraw();
        return;
      }
      if (isPanning.current) { viewTransform.current.x += dx; viewTransform.current.y += dy; scheduleDraw(); }
      else {
        const prev = dragSelection.current;
        if (prev && (prev.endX !== clampedX || prev.endY !== clampedY)) {
          dragSelection.current = { ...prev, endX: clampedX, endY: clampedY }; scheduleDraw();
        }
      }
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false; updateCursor();
        if (!isPanning.current && dragSelection.current) {
          onSelectionCompleteRef.current(dragSelection.current); dragSelection.current = null;
        }
        isPanning.current = false;
      }
    };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); const factor = 1 + (0.1 * (e.deltaY > 0 ? -1 : 1));
      const { x, y, scale } = viewTransform.current;
      let newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale * factor));
      const newX = e.clientX - (e.clientX - x) * (newScale / scale);
      const newY = e.clientY - (e.clientY - y) * (newScale / scale);
      viewTransform.current = { x: newX, y: newY, scale: newScale };
      scheduleDraw(); requestAnimationFrame(() => forceUpdateRef.current());
    };
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [scheduleDraw, viewTransform, updateCursor]);

  useEffect(() => {
    const hkd = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat) { isSpacePressed.current = true; updateCursor(); } };
    const hku = (e: KeyboardEvent) => { if (e.code === 'Space') { isSpacePressed.current = false; updateCursor(); } };
    window.addEventListener('keydown', hkd); window.addEventListener('keyup', hku);
    return () => { window.removeEventListener('keydown', hkd); window.removeEventListener('keyup', hku); };
  }, [updateCursor]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

export const CanvasGrid = React.memo(CanvasGridComponent);
