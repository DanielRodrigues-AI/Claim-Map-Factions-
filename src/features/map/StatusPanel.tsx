import { useMapStore } from "../../stores/mapStore";

export function StatusPanel() {
  const mousePosition = useMapStore((state) => state.mousePosition);
  const currentMap = useMapStore((state) => state.currentMap);

  if (!mousePosition || !currentMap) {
    return null;
  }

  if (
    Math.abs(mousePosition.blockX) > currentMap.size ||
    Math.abs(mousePosition.blockZ) > currentMap.size
  ) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
      <div className="flex gap-6 text-sm">
        <div className="text-gray-400">
          Block X: <span className="text-white font-mono">{mousePosition.blockX}</span>
        </div>
        <div className="text-gray-400">
          Block Z: <span className="text-white font-mono">{mousePosition.blockZ}</span>
        </div>
        <div className="text-gray-400">
          Chunk X: <span className="text-white font-mono">{mousePosition.chunkX}</span>
        </div>
        <div className="text-gray-400">
          Chunk Z: <span className="text-white font-mono">{mousePosition.chunkZ}</span>
        </div>
      </div>
    </div>
  );
}
