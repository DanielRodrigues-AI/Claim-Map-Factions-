import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapCanvas } from '../features/map/MapCanvas';
import { CoordinateSearch } from '../features/search/CoordinateSearch';
import { StatusPanel } from '../features/map/StatusPanel';
import { useMapStore } from '../stores/mapStore';

export function Editor() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentMap = useMapStore((state) => state.currentMap);
  const loadFromStorage = useMapStore((state) => state.loadFromStorage);

useEffect(() => {
  console.log("Editor mounted");

  const state = location.state as { mapId?: string } | null;

  console.log("location.state:", state);

  if (!state?.mapId) {
    console.log("Sem mapId");
    navigate("/");
    return;
  }

  console.log("Carregando:", state.mapId);

  const ok = loadFromStorage(state.mapId);

  console.log("loadFromStorage =", ok);
}, []);
console.log("Editor render");
console.log(currentMap);
  if (!currentMap) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <MapCanvas />
      <CoordinateSearch />
      <StatusPanel />
      
      <div className="absolute top-4 right-4 z-10 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
        <div className="text-white font-semibold">{currentMap.name}</div>
        <div className="text-gray-400 text-xs">Size: {currentMap.size} blocks</div>
      </div>
      
      <button
        onClick={() => {
          const { saveToStorage } = useMapStore.getState();
          saveToStorage();
          navigate('/');
        }}
        className="absolute top-4 left-4 z-10 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-lg px-4 py-2 text-white font-semibold transition"
      >
        ← Back
      </button>
    </div>
  );
}
