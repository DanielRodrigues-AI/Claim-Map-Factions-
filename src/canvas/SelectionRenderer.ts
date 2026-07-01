import type { CameraState } from '../types/map';
import { CHUNK_SIZE, isWithinMapBounds } from '../utils/coordinates';

export class SelectionRenderer {
  draw(ctx: CanvasRenderingContext2D, camera: CameraState, canvasWidth: number, canvasHeight: number, selection: { startChunkX: number; startChunkZ: number; endChunkX: number; endChunkZ: number } | null, mapSize: number): void {
    if (!selection) return;

    const { zoom } = camera;

    const startX = Math.min(selection.startChunkX, selection.endChunkX) * CHUNK_SIZE;
    const endX = (Math.max(selection.startChunkX, selection.endChunkX) + 1) * CHUNK_SIZE;
    const startZ = Math.min(selection.startChunkZ, selection.endChunkZ) * CHUNK_SIZE;
    const endZ = (Math.max(selection.startChunkZ, selection.endChunkZ) + 1) * CHUNK_SIZE;

    if (!isWithinMapBounds(startX, startZ, mapSize) && !isWithinMapBounds(endX, endZ, mapSize)) {
      return;
    }

    const topLeft = this.worldToScreen(startX, startZ, camera, canvasWidth, canvasHeight);
    const bottomRight = this.worldToScreen(endX, endZ, camera, canvasWidth, canvasHeight);

    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;

    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fillRect(topLeft.x, topLeft.y, width, height);

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(topLeft.x, topLeft.y, width, height);
  }

  private worldToScreen(worldX: number, worldY: number, camera: CameraState, canvasWidth: number, canvasHeight: number): { x: number; y: number } {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const screenX = (worldX - camera.x) * camera.zoom + centerX;
    const screenY = (worldY - camera.y) * camera.zoom + centerY;

    return { x: screenX, y: screenY };
  }
}
