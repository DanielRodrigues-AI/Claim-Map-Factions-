import { create } from 'zustand';
import type { MapData, CameraState, MousePosition, Chunk, Faction, Marker } from '../types/map';
import { saveMap, getMap, deleteMap, setCurrentMapId, getCurrentMapId, type StoredMapData } from '../utils/storage';

interface MapStore {
  currentMap: MapData | null;
  chunks: Map<string, Chunk>;
  factions: Map<string, Faction>;
  markers: Map<string, Marker>;
  camera: CameraState;
  mousePosition: MousePosition | null;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  selection: { startChunkX: number; startChunkZ: number; endChunkX: number; endChunkZ: number } | null;
  
  setCurrentMap: (map: MapData | null) => void;
  setCamera: (camera: CameraState) => void;
  setMousePosition: (position: MousePosition | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setDragStart: (start: { x: number; y: number } | null) => void;
  setSelection: (selection: { startChunkX: number; startChunkZ: number; endChunkX: number; endChunkZ: number } | null) => void;
  
  addChunk: (chunk: Chunk) => void;
  updateChunk: (chunkX: number, chunkZ: number, updates: Partial<Chunk>) => void;
  removeChunk: (chunkX: number, chunkZ: number) => void;
  clearChunks: () => void;
  getChunk: (chunkX: number, chunkZ: number) => Chunk | undefined;
  
  addFaction: (faction: Faction) => void;
  updateFaction: (id: string, updates: Partial<Faction>) => void;
  removeFaction: (id: string) => void;
  
  addMarker: (marker: Marker) => void;
  updateMarker: (id: string, updates: Partial<Marker>) => void;
  removeMarker: (id: string) => void;
  
  resetCamera: () => void;
  saveToStorage: () => void;
  loadFromStorage: (mapId: string) => boolean;
  deleteCurrentMap: () => void;
}

const INITIAL_CAMERA: CameraState = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const useMapStore = create<MapStore>((set, get) => ({
  currentMap: null,
  chunks: new Map(),
  factions: new Map(),
  markers: new Map(),
  camera: INITIAL_CAMERA,
  mousePosition: null,
  isDragging: false,
  dragStart: null,
  selection: null,
  
  setCurrentMap: (map) => set({ currentMap: map }),
  
  setCamera: (camera) => set({ camera }),
  
  setMousePosition: (position) => set({ mousePosition: position }),
  
  setIsDragging: (isDragging) => set({ isDragging }),
  
  setDragStart: (start) => set({ dragStart: start }),
  
  setSelection: (selection) => set({ selection }),
  
  addChunk: (chunk) => set((state) => {
    const newChunks = new Map(state.chunks);
    newChunks.set(`${chunk.chunkX},${chunk.chunkZ}`, chunk);
    return { chunks: newChunks };
  }),
  
  updateChunk: (chunkX, chunkZ, updates) => set((state) => {
    const newChunks = new Map(state.chunks);
    const key = `${chunkX},${chunkZ}`;
    const existing = newChunks.get(key);
    if (existing) {
      newChunks.set(key, { ...existing, ...updates });
    }
    return { chunks: newChunks };
  }),
  
  removeChunk: (chunkX, chunkZ) => set((state) => {
    const newChunks = new Map(state.chunks);
    newChunks.delete(`${chunkX},${chunkZ}`);
    return { chunks: newChunks };
  }),
  
  clearChunks: () => set({ chunks: new Map() }),
  
  getChunk: (chunkX, chunkZ) => get().chunks.get(`${chunkX},${chunkZ}`),
  
  addFaction: (faction) => set((state) => {
    const newFactions = new Map(state.factions);
    newFactions.set(faction.id, faction);
    return { factions: newFactions };
  }),
  
  updateFaction: (id, updates) => set((state) => {
    const newFactions = new Map(state.factions);
    const existing = newFactions.get(id);
    if (existing) {
      newFactions.set(id, { ...existing, ...updates });
    }
    return { factions: newFactions };
  }),
  
  removeFaction: (id) => set((state) => {
    const newFactions = new Map(state.factions);
    newFactions.delete(id);
    return { factions: newFactions };
  }),
  
  addMarker: (marker) => set((state) => {
    const newMarkers = new Map(state.markers);
    newMarkers.set(marker.id, marker);
    return { markers: newMarkers };
  }),
  
  updateMarker: (id, updates) => set((state) => {
    const newMarkers = new Map(state.markers);
    const existing = newMarkers.get(id);
    if (existing) {
      newMarkers.set(id, { ...existing, ...updates });
    }
    return { markers: newMarkers };
  }),
  
  removeMarker: (id) => set((state) => {
    const newMarkers = new Map(state.markers);
    newMarkers.delete(id);
    return { markers: newMarkers };
  }),
  
  resetCamera: () => set({ camera: INITIAL_CAMERA }),
  
  saveToStorage: () => {
    const { currentMap, chunks, factions, markers } = get();
    if (!currentMap) return;
    
    const storedData: StoredMapData = {
      id: currentMap.id,
      name: currentMap.name,
      size: currentMap.size,
      createdAt: currentMap.createdAt,
      updatedAt: Date.now(),
      chunks: Object.fromEntries(chunks),
      factions: Object.fromEntries(factions),
      markers: Object.fromEntries(markers),
    };
    
    saveMap(storedData);
    setCurrentMapId(currentMap.id);
  },
  
  loadFromStorage: (mapId) => {
    const storedData = getMap(mapId);
    if (!storedData) return false;
    
    const chunks = new Map(Object.entries(storedData.chunks || {}));
    const factions = new Map(Object.entries(storedData.factions || {}));
    const markers = new Map(Object.entries(storedData.markers || {}));
    
    set({
      currentMap: {
        id: storedData.id,
        name: storedData.name,
        size: storedData.size,
        createdAt: storedData.createdAt,
        updatedAt: storedData.updatedAt,
      },
      chunks,
      factions,
      markers,
      camera: INITIAL_CAMERA,
    });
    
    setCurrentMapId(mapId);
    return true;
  },
  
  deleteCurrentMap: () => {
    const { currentMap } = get();
    if (!currentMap) return;
    
    deleteMap(currentMap.id);
    if (getCurrentMapId() === currentMap.id) {
      setCurrentMapId(null);
    }
    
    set({
      currentMap: null,
      chunks: new Map(),
      factions: new Map(),
      markers: new Map(),
      camera: INITIAL_CAMERA,
    });
  },
}));
