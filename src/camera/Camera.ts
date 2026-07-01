  import type { CameraState } from "../types/map";

  export class Camera {
    private state: CameraState;
    private targetState: CameraState | null = null;
    private animationFrame: number | null = null;
    private onStateChange: ((state: CameraState) => void) | null = null;

    constructor(
      initialState: CameraState,
      onStateChange?: (state: CameraState) => void,
    ) {
      this.state = { ...initialState };
      this.onStateChange = onStateChange || null;
    }

    getState(): CameraState {
      return { ...this.state };
    }

    setState(newState: Partial<CameraState>): void {
      this.state = {
        ...this.state,
        ...newState,
      };
    }

    setTarget(target: CameraState): void {
      this.targetState = { ...target };
      this.animateToTarget();
    }

    private notifyStateChange(): void {
      if (this.onStateChange) {
        this.onStateChange(this.getState());
      }
    }

    private animateToTarget(): void {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }

      if (!this.targetState) return;

      const animate = () => {
        const dx = this.targetState!.x - this.state.x;
        const dy = this.targetState!.y - this.state.y;
        const dzoom = this.targetState!.zoom - this.state.zoom;

        const threshold = 0.1;
        const zoomThreshold = 0.001;

        if (
          Math.abs(dx) < threshold &&
          Math.abs(dy) < threshold &&
          Math.abs(dzoom) < zoomThreshold
        ) {
          this.state = { ...this.targetState! };
          this.targetState = null;
          return;
        }

        this.state.x += dx * 0.1;
        this.state.y += dy * 0.1;
        this.state.zoom += dzoom * 0.1;

        this.notifyStateChange();
        this.animationFrame = requestAnimationFrame(animate);
      };

      animate();
    }

    screenToWorld(
      screenX: number,
      screenY: number,
      canvasWidth: number,
      canvasHeight: number,
    ): { x: number; y: number } {
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const worldX = (screenX - centerX) / this.state.zoom + this.state.x;
      const worldY = (screenY - centerY) / this.state.zoom + this.state.y;

      return { x: worldX, y: worldY };
    }

    worldToScreen(
      worldX: number,
      worldY: number,
      canvasWidth: number,
      canvasHeight: number,
    ): { x: number; y: number } {
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const screenX = (worldX - this.state.x) * this.state.zoom + centerX;
      const screenY = (worldY - this.state.y) * this.state.zoom + centerY;

      return { x: screenX, y: screenY };
    }

    zoom(
      delta: number,
      centerX: number,
      centerY: number,
      canvasWidth: number,
      canvasHeight: number,
      mapSize: number,
    ): void {
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      const minDimension = Math.min(canvasWidth, canvasHeight);
      const minZoom = minDimension / (mapSize * 2.2);
      const newZoom = Math.max(
        minZoom,
        Math.min(10, this.state.zoom * zoomFactor),
      );

      const worldPos = this.screenToWorld(
        centerX,
        centerY,
        canvasWidth,
        canvasHeight,
      );

      this.state.zoom = newZoom;

      const newScreenPos = this.worldToScreen(
        worldPos.x,
        worldPos.y,
        canvasWidth,
        canvasHeight,
      );

      this.state.x += (centerX - newScreenPos.x) / newZoom;
      this.state.y += (centerY - newScreenPos.y) / newZoom;

      this.notifyStateChange();
    }

    pan(dx: number, dy: number): void {
      this.state.x -= dx / this.state.zoom;
      this.state.y -= dy / this.state.zoom;
      this.notifyStateChange();
    }

    isAnimating(): boolean {
      return this.targetState !== null;
    }

    cancelAnimation(): void {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      this.targetState = null;
    }
  }
