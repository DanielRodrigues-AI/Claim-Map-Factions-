export const CHUNK_SIZE = 16;

export function blockToChunk(blockX: number, blockZ: number): { chunkX: number; chunkZ: number } {
  return {
    chunkX: Math.floor(blockX / CHUNK_SIZE),
    chunkZ: Math.floor(blockZ / CHUNK_SIZE),
  };
}

export function chunkToBlock(chunkX: number, chunkZ: number): { blockX: number; blockZ: number } {
  return {
    blockX: chunkX * CHUNK_SIZE,
    blockZ: chunkZ * CHUNK_SIZE,
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: { x: number; y: number; zoom: number },
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const worldX = (screenX - centerX) / camera.zoom + camera.x;
  const worldY = (screenY - centerY) / camera.zoom + camera.y;

  return { x: worldX, y: worldY };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: { x: number; y: number; zoom: number },
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const screenX = (worldX - camera.x) * camera.zoom + centerX;
  const screenY = (worldY - camera.y) * camera.zoom + centerY;

  return { x: screenX, y: screenY };
}

export function isWithinMapBounds(x: number, z: number, mapSize: number): boolean {
  return x >= -mapSize && x <= mapSize && z >= -mapSize && z <= mapSize;
}

export function isChunkWithinMapBounds(chunkX: number, chunkZ: number, mapSize: number): boolean {
  const blockX = chunkX * CHUNK_SIZE;
  const blockZ = chunkZ * CHUNK_SIZE;
  return isWithinMapBounds(blockX, blockZ, mapSize);
}

export function getMapChunkBounds(mapSize: number): { minChunkX: number; maxChunkX: number; minChunkZ: number; maxChunkZ: number } {
  const minChunkX = Math.floor(-mapSize / CHUNK_SIZE);
  const maxChunkX = Math.floor(mapSize / CHUNK_SIZE);
  const minChunkZ = Math.floor(-mapSize / CHUNK_SIZE);
  const maxChunkZ = Math.floor(mapSize / CHUNK_SIZE);
  return { minChunkX, maxChunkX, minChunkZ, maxChunkZ };
}

export class CoordinateTransformer {
  static worldToScreen(worldX: number, worldY: number, camera: { x: number; y: number; zoom: number }, canvasWidth: number, canvasHeight: number): { x: number; y: number } {
    return worldToScreen(worldX, worldY, camera, canvasWidth, canvasHeight);
  }

  static screenToWorld(screenX: number, screenY: number, camera: { x: number; y: number; zoom: number }, canvasWidth: number, canvasHeight: number): { x: number; y: number } {
    return screenToWorld(screenX, screenY, camera, canvasWidth, canvasHeight);
  }
}
