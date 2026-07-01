import type { CameraState, Marker } from '../types/map';
import { isWithinMapBounds } from '../utils/coordinates';

export class MarkerRenderer {
  draw(ctx: CanvasRenderingContext2D, camera: CameraState, canvasWidth: number, canvasHeight: number, markers: Map<string, Marker>, mapSize: number): void {
    const { zoom } = camera;

    for (const marker of markers.values()) {
      if (!isWithinMapBounds(marker.x, marker.z, mapSize)) {
        continue;
      }

      const screenPos = this.worldToScreen(marker.x, marker.z, camera, canvasWidth, canvasHeight);

      ctx.fillStyle = marker.color;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 8 / zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();

      if (zoom > 0.5) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${12 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(marker.name, screenPos.x, screenPos.y - 12 / zoom);
      }
    }
  }

  private worldToScreen(worldX: number, worldY: number, camera: CameraState, canvasWidth: number, canvasHeight: number): { x: number; y: number } {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const screenX = (worldX - camera.x) * camera.zoom + centerX;
    const screenY = (worldY - camera.y) * camera.zoom + centerY;

    return { x: screenX, y: screenY };
  }
}
