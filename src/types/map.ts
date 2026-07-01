export interface MapData {
  id: string;
  name: string;
  size: number;
  createdAt: number;
  updatedAt: number;
}

export interface Chunk {
  chunkX: number;
  chunkZ: number;
  ownerId?: string;
  color: string;
  selected: boolean;
}

export interface Faction {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Marker {
  id: string;
  name: string;
  x: number;
  z: number;
  color: string;
  factionId?: string;
  createdAt: number;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface MousePosition {
  blockX: number;
  blockZ: number;
  chunkX: number;
  chunkZ: number;
  screenX: number;
  screenY: number;
}

export interface CoordinateSearch {
  x: number;
  z: number;
}
