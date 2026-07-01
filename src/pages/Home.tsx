import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMaps, deleteMap, type StoredMapData } from '../utils/storage';

export function Home() {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<StoredMapData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [newMapSize, setNewMapSize] = useState(10000);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingMapName, setEditingMapName] = useState('');

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = () => {
    const allMaps = getAllMaps();
    setMaps(Object.values(allMaps));
  };

  const handleCreateMap = () => {
    if (!newMapName.trim()) return;

    const newMap: StoredMapData = {
      id: crypto.randomUUID(),
      name: newMapName.trim(),
      size: newMapSize,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chunks: {},
      factions: {},
      markers: {},
    };

    // Save to localStorage before navigation
    const allMaps = getAllMaps();
    allMaps[newMap.id] = newMap;
    localStorage.setItem('factionmap_maps', JSON.stringify(allMaps));

    setShowCreateModal(false);
    setNewMapName('');
    setNewMapSize(10000);
    navigate('/editor', { state: { mapId: newMap.id } });
  };

  const handleOpenMap = (mapId: string) => {
    navigate('/editor', { state: { mapId } });
  };

  const handleDeleteMap = (mapId: string) => {
    if (confirm('Are you sure you want to delete this map?')) {
      deleteMap(mapId);
      loadMaps();
    }
  };

  const handleStartEdit = (mapId: string, currentName: string) => {
    setEditingMapId(mapId);
    setEditingMapName(currentName);
  };

  const handleSaveEdit = (mapId: string) => {
    if (!editingMapName.trim()) return;

    const allMaps = getAllMaps();
    if (allMaps[mapId]) {
      allMaps[mapId].name = editingMapName.trim();
      allMaps[mapId].updatedAt = Date.now();
      localStorage.setItem('factionmap_maps', JSON.stringify(allMaps));
      loadMaps();
    }
    setEditingMapId(null);
    setEditingMapName('');
  };

  const handleCancelEdit = () => {
    setEditingMapId(null);
    setEditingMapName('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Faction Map Editor</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            + New Map
          </button>
        </div>

        {maps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">No maps found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Create your first map
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maps.map((map) => (
              <div
                key={map.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition"
              >
                {editingMapId === map.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingMapName}
                      onChange={(e) => setEditingMapName(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(map.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2">{map.name}</h3>
                    <p className="text-gray-400 text-sm mb-1">Size: {map.size} blocks</p>
                    <p className="text-gray-500 text-xs mb-4">
                      Updated: {formatDate(map.updatedAt)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenMap(map.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-semibold transition"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleStartEdit(map.id, map.name)}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMap(map.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Map</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Map Name</label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="e.g., MineHero"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Map Size (blocks)</label>
                <input
                  type="number"
                  value={newMapSize}
                  onChange={(e) => setNewMapSize(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  min="1000"
                  max="100000"
                  step="1000"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Range: -{newMapSize} to +{newMapSize} on both axes
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateMap}
                  disabled={!newMapName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-semibold transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
