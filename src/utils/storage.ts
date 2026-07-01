const MAPS_STORAGE_KEY = 'factionmap_maps';
const CURRENT_MAP_KEY = 'factionmap_current_map';

export interface StoredMapData {
  id: string;
  name: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  chunks: Record<string, any>;
  factions: Record<string, any>;
  markers: Record<string, any>;
}

export function saveMap(mapData: StoredMapData): void {
  const maps = getAllMaps();
  maps[mapData.id] = mapData;
  localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(maps));
}

export function getAllMaps(): Record<string, StoredMapData> {
  const data = localStorage.getItem(MAPS_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function getMap(id: string): StoredMapData | null {
  const maps = getAllMaps();
  return maps[id] || null;
}

export function deleteMap(id: string): void {
  const maps = getAllMaps();
  delete maps[id];
  localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(maps));
}

export function setCurrentMapId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_MAP_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_MAP_KEY);
  }
}

export function getCurrentMapId(): string | null {
  return localStorage.getItem(CURRENT_MAP_KEY);
}
