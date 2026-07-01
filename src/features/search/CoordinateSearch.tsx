import { useState, useRef } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { blockToChunk } from '../../utils/coordinates';
import { Camera } from '../../camera/Camera';

export function CoordinateSearch() {
  const [searchX, setSearchX] = useState('');
  const [searchZ, setSearchZ] = useState('');
  const cameraRef = useRef<Camera | null>(null);
  const { camera, setCamera } = useMapStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const x = parseInt(searchX);
    const z = parseInt(searchZ);
    
    if (isNaN(x) || isNaN(z)) return;

    const { chunkX, chunkZ } = blockToChunk(x, z);
    const targetX = chunkX * 16 + 8;
    const targetZ = chunkZ * 16 + 8;

    if (!cameraRef.current) {
      cameraRef.current = new Camera(camera, (newCameraState) => {
        setCamera(newCameraState);
      });
    }

    cameraRef.current.setTarget({
      x: targetX,
      y: targetZ,
      zoom: camera.zoom,
    });
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="number"
          value={searchX}
          onChange={(e) => setSearchX(e.target.value)}
          placeholder="X"
          className="w-24 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
        />
        <input
          type="number"
          value={searchZ}
          onChange={(e) => setSearchZ(e.target.value)}
          placeholder="Z"
          className="w-24 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm font-semibold transition"
        >
          Go
        </button>
      </form>
    </div>
  );
}
