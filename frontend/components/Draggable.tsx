import React, { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableProps {
  children: React.ReactNode;
  className?: string; // For initial positioning (e.g., "fixed top-4 left-4")
  baseTransform?: string; // For centering transforms (e.g., "-translate-x-1/2")
}

export const Draggable: React.FC<DraggableProps> = ({ 
  children, 
  className = "", 
  baseTransform = "" 
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setOffset({
        x: offsetStartRef.current.x + dx,
        y: offsetStartRef.current.y + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the handle or the container background
    // If the user clicks a button or input inside children, don't drag
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' || 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'A' ||
      target.closest('button') || 
      target.closest('input') || 
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...offset };
    document.body.style.cursor = 'grabbing';
  };

  return (
    <div 
      className={`${className} flex items-center gap-2 select-none z-50`}
      style={{ 
        transform: `${baseTransform} translate(${offset.x}px, ${offset.y}px)`,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Explicit Drag Handle */}
      <div 
        className="p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-gray-200 text-gray-400 cursor-grab active:cursor-grabbing hover:bg-white hover:text-gray-600 transition-colors shrink-0"
        title="Arrastar"
      >
        <GripVertical size={16} />
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};