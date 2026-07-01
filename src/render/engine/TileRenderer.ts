import type { CameraState, Chunk } from "../../types/map";
import { CHUNK_SIZE } from "../../utils/coordinates";
import { ChunkRenderer } from "../../canvas/ChunkRenderer";
import { TileCache } from "./TileCache";

export class TileRenderer {
  private cache = new TileCache();
  private chunkRenderer = new ChunkRenderer();

  render(
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    width: number,
    height: number,
    chunks: Map<string, Chunk>,
    mapSize: number,
  ): void {
    const size = CHUNK_SIZE;
    const { x: camX, y: camY, zoom } = camera;

    const maxChunkCoord = Math.floor(mapSize / size);
    const minChunkCoord = -maxChunkCoord;

    if (zoom < 0.05) {
      return;
    }

    const startX = Math.max(
      minChunkCoord,
      Math.floor((camX - width / 2 / zoom) / size),
    );
    const endX = Math.min(
      maxChunkCoord,
      Math.ceil((camX + width / 2 / zoom) / size),
    );
    const startY = Math.max(
      minChunkCoord,
      Math.floor((camY - height / 2 / zoom) / size),
    );
    const endY = Math.min(
      maxChunkCoord,
      Math.ceil((camY + height / 2 / zoom) / size),
    );

    const renderStart = performance.now();
    let visibleChunks = 0;
    let renderedChunks = 0;

    for (const chunk of chunks.values()) {
      const x = chunk.chunkX;
      const y = chunk.chunkZ;

      if (x < startX || x > endX || y < startY || y > endY) continue;

      const canvas = this.cache.getCanvas(chunk, size);
      const cctx = canvas.getContext("2d");
      if (!cctx) continue;

      if (canvas.dataset.version !== chunk.color) {
        cctx.clearRect(0, 0, size, size);
        this.chunkRenderer.renderChunkToCanvas(cctx, chunk);
        canvas.dataset.version = chunk.color;
      }

      const screenX = (x * size - camX) * zoom + width / 2;
      const screenY = (y * size - camY) * zoom + height / 2;

      ctx.drawImage(canvas, screenX, screenY, size * zoom, size * zoom);
    }

    const renderTime = performance.now() - renderStart;

    if (renderTime > 5) {
      console.log("[TileRenderer]", {
        time: renderTime.toFixed(2) + "ms",
        zoom: zoom.toFixed(3),
        visibleChunks,
        renderedChunks,
      });
    }
  }
}
