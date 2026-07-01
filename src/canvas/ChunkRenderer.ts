import type { Chunk } from '../types/map';
import { CHUNK_SIZE } from '../utils/coordinates';

export class ChunkRenderer {
  renderChunkToCanvas(ctx: CanvasRenderingContext2D, chunk: Chunk): void {
    ctx.fillStyle = chunk.color;
    ctx.fillRect(0, 0, CHUNK_SIZE, CHUNK_SIZE);

    if (chunk.selected) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, CHUNK_SIZE, CHUNK_SIZE);
    }
  }
}