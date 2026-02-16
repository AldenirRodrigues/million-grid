
export type ToolType = 'select' | 'pan' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface GridSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface BaseItem {
  id: string;
  x: number; // Grid X
  y: number; // Grid Y
  w: number; // Width in cells
  h: number; // Height in cells
  title: string;
  link?: string;
  message?: string;
}

export interface UploadedImage extends BaseItem {
  type: 'image';
  src: string;
  rotation: number;
  brightness: number;
  contrast: number;
  zoom: number; // Scale factor (1 = 100%)
  offsetX: number; // Offset in pixels
  offsetY: number; // Offset in pixels
}

export interface GridText extends BaseItem {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bgColor: string;
  fontWeight: string;
}

export type GridItem = UploadedImage | GridText;

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface PresetMode {
  type: 'text' | 'image';
  content: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    bgColor?: string;
    fontWeight?: string;
  };
  imageConfig?: {
    title?: string;
  };
}
