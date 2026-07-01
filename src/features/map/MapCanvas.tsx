import { useEffect, useRef, useState } from "react";
import { useMapStore } from "../../stores/mapStore";
import { Renderer } from "../../canvas/Renderer";
import { Camera } from "../../camera/Camera";
import { Grid } from "../../canvas/Grid";
import { CHUNK_SIZE, isWithinMapBounds } from "../../utils/coordinates";
import { ColorPicker } from "./ColorPicker";

export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const gridRef = useRef<Grid | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [paintColor, setPaintColor] = useState("#3B82F6");
  const [isPainting, setIsPainting] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const {
    camera,
    setCamera,
    mousePosition,
    currentMap,
    chunks,
    markers,
    selection,
    setMousePosition,
    setDragStart,
    setSelection,
    addChunk,
    updateChunk,
    getChunk,
    saveToStorage,
  } = useMapStore();

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new Renderer(canvasRef.current);
      gridRef.current = new Grid();

      cameraRef.current = new Camera(camera, (newCameraState) => {
        setCamera(newCameraState);
      });
    }
  }, []);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.setState(camera);
    }
  }, [camera]);

  useEffect(() => {
    if (!canvasRef.current || !rendererRef.current) return;

    const resizeCanvas = () => {
      canvasRef.current!.width = window.innerWidth;
      canvasRef.current!.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !rendererRef.current || !currentMap) return;

    const render = () => {
      rendererRef.current!.render(
        camera,
        canvasRef.current!.width,
        canvasRef.current!.height,
        currentMap.size,
        currentMap.name,
        chunks,
        markers,
        selection,
        mousePosition,
      );
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [camera, currentMap, chunks, markers, selection, mousePosition]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentMap) {
        saveToStorage();
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [currentMap, saveToStorage]);

  const paintChunk = (chunkX: number, chunkZ: number) => {
    if (!currentMap) return;

    const worldX = chunkX * CHUNK_SIZE;
    const worldZ = chunkZ * CHUNK_SIZE;

    if (!isWithinMapBounds(worldX, worldZ, currentMap.size)) {
      return;
    }

    const existingChunk = getChunk(chunkX, chunkZ);
    if (existingChunk) {
      updateChunk(chunkX, chunkZ, { color: paintColor });
    } else {
      addChunk({
        chunkX,
        chunkZ,
        color: paintColor,
        selected: false,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentMap || !gridRef.current) return;

    const { blockX, blockZ } = gridRef.current.screenToBlock(
      e.clientX,
      e.clientY,
      camera,
      canvasRef.current!.width,
      canvasRef.current!.height,
    );

    if (!isWithinMapBounds(blockX, blockZ, currentMap.size)) {
      return;
    }

    const { chunkX, chunkZ } = gridRef.current.blockToChunk(blockX, blockZ);

    if (e.button === 0) {
      if (e.shiftKey) {
        setIsPanning(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else {
        setIsPainting(true);
        paintChunk(chunkX, chunkZ);
      }
    } else if (e.button === 2) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentMap || !gridRef.current) return;

    const { dragStart } = useMapStore.getState();

    if (isPanning && dragStart && cameraRef.current) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      cameraRef.current.pan(dx, dy);
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    const { blockX, blockZ } = gridRef.current.screenToBlock(
      e.clientX,
      e.clientY,
      camera,
      canvasRef.current!.width,
      canvasRef.current!.height,
    );

    const maxAllowed = currentMap.size + 100;
    if (
      blockX < -maxAllowed ||
      blockX > maxAllowed ||
      blockZ < -maxAllowed ||
      blockZ > maxAllowed
    ) {
      setMousePosition(null);
      return;
    }

// Em zoom muito distante desativa atualizações constantes do mouse para eliminar o lag de render
    if (camera.zoom < 0.15) {
      if (mousePosition !== null) {
        setMousePosition(null);
      }
      return;
    }

    // Evita chamadas repetidas ao Zustand se o mouse continuar dentro do mesmo bloco Minecraft
    if (mousePosition && mousePosition.blockX === blockX && mousePosition.blockZ === blockZ) {
      return;
    }

    const { chunkX, chunkZ } = gridRef.current.blockToChunk(blockX, blockZ);

    setMousePosition({
      blockX,
      blockZ,
      chunkX,
      chunkZ,
      screenX: e.clientX,
      screenY: e.clientY,
    });

    if (isPainting) {
      paintChunk(chunkX, chunkZ);
    }
  };

  const handleMouseUp = () => {
    setIsPainting(false);
    setIsPanning(false);
    setDragStart(null);
    setSelection(null);
    saveToStorage();
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (cameraRef.current && canvasRef.current && currentMap) {
      cameraRef.current.zoom(
        e.deltaY,
        e.clientX,
        e.clientY,
        canvasRef.current.width,
        canvasRef.current.height,
        currentMap.size,
      );
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      />
      <ColorPicker onColorSelect={setPaintColor} />
    </>
  );
}
