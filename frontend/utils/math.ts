import { CELL_SIZE } from '../constants';
import { Point, ViewportTransform } from '../types';

/**
 * Converts screen pixel coordinates to grid cell coordinates.
 */
export const screenToGrid = (
  screenX: number,
  screenY: number,
  transform: ViewportTransform
): Point => {
  const worldX = (screenX - transform.x) / transform.scale;
  const worldY = (screenY - transform.y) / transform.scale;
  
  return {
    x: Math.floor(worldX / CELL_SIZE),
    y: Math.floor(worldY / CELL_SIZE),
  };
};

/**
 * Normalizes a selection rectangle so start is top-left and end is bottom-right.
 */
export const normalizeSelection = (x1: number, y1: number, x2: number, y2: number) => {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1) + 1,
    h: Math.abs(y2 - y1) + 1,
  };
};

/**
 * Formats bytes to human readable string.
 */
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};