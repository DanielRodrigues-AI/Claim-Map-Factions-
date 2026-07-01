import type { CameraState } from "../types/map";
import { CHUNK_SIZE, getMapChunkBounds } from "../utils/coordinates";

export class Grid {
  draw(
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
    mapSize: number,
  ): void {
    const { x: cameraX, y: cameraY, zoom } = camera;

    const { minChunkX, maxChunkX, minChunkZ, maxChunkZ } =
      getMapChunkBounds(mapSize);

    const minBlockX = minChunkX * CHUNK_SIZE;
    const maxBlockX = (maxChunkX + 1) * CHUNK_SIZE;
    const minBlockZ = minChunkZ * CHUNK_SIZE;
    const maxBlockZ = (maxChunkZ + 1) * CHUNK_SIZE;

    const startX = Math.max(
      minBlockX,
      Math.floor((cameraX - canvasWidth / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );
    const endX = Math.min(
      maxBlockX,
      Math.ceil((cameraX + canvasWidth / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );
    const startY = Math.max(
      minBlockZ,
      Math.floor((cameraY - canvasHeight / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );
    const endY = Math.min(
      maxBlockZ,
      Math.ceil((cameraY + canvasHeight / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );

if (zoom > 0.35) {
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1 / zoom;
      for (let x = startX; x <= endX; x += CHUNK_SIZE) {
        const screenX = this.worldToScreenX(x, cameraX, zoom, canvasWidth);
        ctx.beginPath();
        ctx.moveTo(screenX, Math.max(0, this.worldToScreenY(-mapSize, cameraY, zoom, canvasHeight)));
        ctx.lineTo(screenX, Math.min(canvasHeight, this.worldToScreenY(mapSize, cameraY, zoom, canvasHeight)));
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += CHUNK_SIZE) {
        const screenY = this.worldToScreenY(y, cameraY, zoom, canvasHeight);
        ctx.beginPath();
        ctx.moveTo(Math.max(0, this.worldToScreenX(-mapSize, cameraX, zoom, canvasWidth)), screenY);
        ctx.lineTo(Math.min(canvasWidth, this.worldToScreenX(mapSize, cameraX, zoom, canvasWidth)), screenY);
        ctx.stroke();
      }
    }

    if (zoom <= 0.35) {
      let interval = 1000;
      if (zoom < 0.04) interval = 5000;
      else if (zoom < 0.08) interval = 2500;
      else if (zoom <= 0.35) interval = 256;

      ctx.strokeStyle = "rgba(75, 85, 99, 0.3)";
      ctx.lineWidth = 1;

      const macroStartX = Math.max(-mapSize, Math.floor((cameraX - canvasWidth / 2 / zoom) / interval) * interval);
      const macroEndX = Math.min(mapSize, Math.ceil((cameraX + canvasWidth / 2 / zoom) / interval) * interval);
      const macroStartY = Math.max(-mapSize, Math.floor((cameraY - canvasHeight / 2 / zoom) / interval) * interval);
      const macroEndY = Math.min(mapSize, Math.ceil((cameraY + canvasHeight / 2 / zoom) / interval) * interval);

      for (let x = macroStartX; x <= macroEndX; x += interval) {
        if (x === 0) continue;
        const screenX = this.worldToScreenX(x, cameraX, zoom, canvasWidth);
        ctx.beginPath();
        ctx.moveTo(screenX, Math.max(0, this.worldToScreenY(-mapSize, cameraY, zoom, canvasHeight)));
        ctx.lineTo(screenX, Math.min(canvasHeight, this.worldToScreenY(mapSize, cameraY, zoom, canvasHeight)));
        ctx.stroke();
      }
      for (let y = macroStartY; y <= macroEndY; y += interval) {
        if (y === 0) continue;
        const screenY = this.worldToScreenY(y, cameraY, zoom, canvasHeight);
        ctx.beginPath();
        ctx.moveTo(Math.max(0, this.worldToScreenX(-mapSize, cameraX, zoom, canvasWidth)), screenY);
        ctx.lineTo(Math.min(canvasWidth, this.worldToScreenX(mapSize, cameraX, zoom, canvasWidth)), screenY);
        ctx.stroke();
      }
    }

    if (zoom > 0.35) {
      this.drawChunkBorders(ctx, camera, canvasWidth, canvasHeight, mapSize);
    }

    // Desenha as Linhas dos Eixos Centrais (0,0 Quadrantes)
// Desenha as Linhas dos Eixos Centrais (0,0 Quadrantes) finas de 1px fixo
    const axisX = this.worldToScreenX(0, cameraX, zoom, canvasWidth);
    const axisY = this.worldToScreenY(0, cameraY, zoom, canvasHeight);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(axisX, Math.max(0, this.worldToScreenY(-mapSize, cameraY, zoom, canvasHeight)));
    ctx.lineTo(axisX, Math.min(canvasHeight, this.worldToScreenY(mapSize, cameraY, zoom, canvasHeight)));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(Math.max(0, this.worldToScreenX(-mapSize, cameraX, zoom, canvasWidth)), axisY);
    ctx.lineTo(Math.min(canvasWidth, this.worldToScreenX(mapSize, cameraX, zoom, canvasWidth)), axisY);
    ctx.stroke();

    this.drawMapBorder(ctx, camera, canvasWidth, canvasHeight, mapSize);
    this.drawCoordinateLabels(ctx, camera, canvasWidth, canvasHeight, mapSize);
  }

private drawCoordinateLabels(
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
    mapSize: number
  ): void {
    const { x: cameraX, y: cameraY, zoom } = camera;
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let step = 1000;
    if (zoom < 0.04) step = 5000;
    else if (zoom < 0.08) step = 2500;

    const minX = this.worldToScreenX(-mapSize, cameraX, zoom, canvasWidth);
    const maxX = this.worldToScreenX(mapSize, cameraX, zoom, canvasWidth);
    const minY = this.worldToScreenY(-mapSize, cameraY, zoom, canvasHeight);
    const maxY = this.worldToScreenY(mapSize, cameraY, zoom, canvasHeight);

    for (let x = -mapSize; x <= mapSize; x += step) {
      const screenX = this.worldToScreenX(x, cameraX, zoom, canvasWidth);
      if (screenX >= minX && screenX <= maxX) {
        if (minY >= 0 && minY <= canvasHeight) ctx.fillText(`${x}`, screenX, minY - 12);
        if (maxY >= 0 && maxY <= canvasHeight) ctx.fillText(`${x}`, screenX, maxY + 12);
      }
    }

    for (let y = -mapSize; y <= mapSize; y += step) {
      const screenY = this.worldToScreenY(y, cameraY, zoom, canvasHeight);
      if (screenY >= minY && screenY <= maxY) {
        if (minX >= 0 && minX <= canvasWidth) {
          ctx.textAlign = "right";
          ctx.fillText(`${y}`, minX - 10, screenY);
        }
        if (maxX >= 0 && maxX <= canvasWidth) {
          ctx.textAlign = "left";
          ctx.fillText(`${y}`, maxX + 10, screenY);
        }
      }
    }
  }

  private drawChunkBorders(
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
    mapSize: number,
  ): void {
    const { x: cameraX, y: cameraY, zoom } = camera;
    const { minChunkX, maxChunkX, minChunkZ, maxChunkZ } =
      getMapChunkBounds(mapSize);
    const minBlockX = minChunkX * CHUNK_SIZE;
    const maxBlockX = (maxChunkX + 1) * CHUNK_SIZE;
    const minBlockZ = minChunkZ * CHUNK_SIZE;
    const maxBlockZ = (maxChunkZ + 1) * CHUNK_SIZE;
    const startX = Math.max(
      minBlockX,
      Math.floor((cameraX - canvasWidth / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );
    const endX = Math.min(
      maxBlockX,
      Math.ceil((cameraX + canvasWidth / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );
    const startY = Math.max(
      minBlockZ,
      Math.floor((cameraY - canvasHeight / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );
    const endY = Math.min(
      maxBlockZ,
      Math.ceil((cameraY + canvasHeight / 2 / zoom) / CHUNK_SIZE) * CHUNK_SIZE,
    );

    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 2 / zoom;

    for (let gridX = startX; gridX <= endX; gridX += CHUNK_SIZE * 4) {
      const screenX = this.worldToScreenX(gridX, cameraX, zoom, canvasWidth);
      ctx.beginPath();
      ctx.moveTo(
        screenX,
        Math.max(0, this.worldToScreenY(-mapSize, cameraY, zoom, canvasHeight)),
      );
      ctx.lineTo(
        screenX,
        Math.min(
          canvasHeight,
          this.worldToScreenY(mapSize, cameraY, zoom, canvasHeight),
        ),
      );
      ctx.stroke();
    }

    for (let gridY = startY; gridY <= endY; gridY += CHUNK_SIZE * 4) {
      const screenY = this.worldToScreenY(gridY, cameraY, zoom, canvasHeight);
      ctx.beginPath();
      ctx.moveTo(
        Math.max(0, this.worldToScreenX(-mapSize, cameraX, zoom, canvasWidth)),
        screenY,
      );
      ctx.lineTo(
        Math.min(
          canvasWidth,
          this.worldToScreenX(mapSize, cameraX, zoom, canvasWidth),
        ),
        screenY,
      );
      ctx.stroke();
    }
  }
  private drawMapBorder(
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
    mapSize: number,
  ): void {
    const { x: cameraX, y: cameraY, zoom } = camera;
    const minX = this.worldToScreenX(-mapSize, cameraX, zoom, canvasWidth);
    const maxX = this.worldToScreenX(mapSize, cameraX, zoom, canvasWidth);
    const minY = this.worldToScreenY(-mapSize, cameraY, zoom, canvasHeight);
    const maxY = this.worldToScreenY(mapSize, cameraY, zoom, canvasHeight);

    ctx.strokeStyle = "#EF4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  }

  private worldToScreenX(
    worldX: number,
    cameraX: number,
    zoom: number,
    canvasWidth: number,
  ): number {
    return (worldX - cameraX) * zoom + canvasWidth / 2;
  }

  private worldToScreenY(
    worldY: number,
    cameraY: number,
    zoom: number,
    canvasHeight: number,
  ): number {
    return (worldY - cameraY) * zoom + canvasHeight / 2;
  }

  screenToBlock(
    screenX: number,
    screenY: number,
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
  ): { blockX: number; blockZ: number } {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const worldX = (screenX - centerX) / camera.zoom + camera.x;
    const worldY = (screenY - centerY) / camera.zoom + camera.y;

    const blockX = Math.floor(worldX);
    const blockZ = Math.floor(worldY);

    return { blockX, blockZ };
  }

  blockToChunk(
    blockX: number,
    blockZ: number,
  ): { chunkX: number; chunkZ: number } {
    const chunkX = Math.floor(blockX / CHUNK_SIZE);
    const chunkZ = Math.floor(blockZ / CHUNK_SIZE);

    return { chunkX, chunkZ };
  }
}
