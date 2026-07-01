import type { CameraState, Chunk, Marker, MousePosition } from '../types/map';
import { BackgroundRenderer } from './BackgroundRenderer';
import { Grid } from './Grid';
import { TileRenderer } from '../render/engine/TileRenderer';
import { MarkerRenderer } from './MarkerRenderer';
import { SelectionRenderer } from './SelectionRenderer';
import { CursorRenderer } from './CursorRenderer';


export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private backgroundRenderer: BackgroundRenderer;
  private grid: Grid;
  private tileRenderer: TileRenderer;
  private markerRenderer: MarkerRenderer;
  private selectionRenderer: SelectionRenderer;
  private cursorRenderer: CursorRenderer;
  

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.backgroundRenderer = new BackgroundRenderer();
    this.grid = new Grid();
    this.tileRenderer = new TileRenderer();
    this.markerRenderer = new MarkerRenderer();
    this.selectionRenderer = new SelectionRenderer();
    this.cursorRenderer = new CursorRenderer();
    
  }

  render(
    camera: CameraState,
    canvasWidth: number,
    canvasHeight: number,
    mapSize: number,
    _mapName: string,
    chunks: Map<string, Chunk>,
    markers: Map<string, Marker>,
    selection: { startChunkX: number; startChunkZ: number; endChunkX: number; endChunkZ: number } | null,
    mousePosition: MousePosition | null
  ): void {
    this.backgroundRenderer.draw(this.ctx, canvasWidth, canvasHeight);
    this.grid.draw(this.ctx, camera, canvasWidth, canvasHeight, mapSize);
    this.tileRenderer.render(this.ctx, camera, canvasWidth, canvasHeight, chunks, mapSize);
    this.markerRenderer.draw(this.ctx, camera, canvasWidth, canvasHeight, markers, mapSize);
    this.selectionRenderer.draw(this.ctx, camera, canvasWidth, canvasHeight, selection, mapSize);
    this.cursorRenderer.draw(this.ctx, camera, canvasWidth, canvasHeight, mousePosition, mapSize);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}
