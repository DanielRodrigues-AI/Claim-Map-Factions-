import type { CameraState, MousePosition } from "../types/map";
import { CHUNK_SIZE, isWithinMapBounds } from "../utils/coordinates";

export class CursorRenderer {
  draw(
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
    mousePosition: MousePosition | null,
    mapSize: number,
  ): void {
    if (!mousePosition) return;

    const { zoom } = camera;

    if (zoom < 0.12) {
      return;
    }

    if (
      !isWithinMapBounds(mousePosition.blockX, mousePosition.blockZ, mapSize)
    ) {
      return;
    }

    const currentChunkX =
      Math.floor(mousePosition.blockX / CHUNK_SIZE) * CHUNK_SIZE;
    const currentChunkZ =
      Math.floor(mousePosition.blockZ / CHUNK_SIZE) * CHUNK_SIZE;
    const screenPos = this.worldToScreen(
      currentChunkX,
      currentChunkZ,
      camera,
      canvasWidth,
      canvasHeight,
    );

    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      screenPos.x,
      screenPos.y,
      CHUNK_SIZE * zoom,
      CHUNK_SIZE * zoom,
    );
  }

  private worldToScreen(
    worldX: number,
    worldY: number,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
  ): { x: number; y: number } {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const screenX = (worldX - camera.x) * camera.zoom + centerX;
    const screenY = (worldY - camera.y) * camera.zoom + centerY;

    return { x: screenX, y: screenY };
  }
}
