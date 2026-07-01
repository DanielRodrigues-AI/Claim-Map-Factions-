import type { Chunk } from "../../types/map";

type CachedChunk = {
  canvas: HTMLCanvasElement;
  version: string;
};

export class TileCache {
  private cache = new Map<string, CachedChunk>();

  getCanvas(chunk: Chunk, size: number): HTMLCanvasElement {
    const key = `${chunk.chunkX},${chunk.chunkZ}`;
    const version = chunk.color;

    let entry = this.cache.get(key);

    if (!entry) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      entry = {
        canvas,
        version: ""
      };

      this.cache.set(key, entry);
    }

    if (entry.version !== version) {
      const ctx = entry.canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
      }
      entry.version = version;
    }

    return entry.canvas;
  }

  markDirty(chunkX: number, chunkZ: number): void {
    this.cache.delete(`${chunkX},${chunkZ}`);
  }
}