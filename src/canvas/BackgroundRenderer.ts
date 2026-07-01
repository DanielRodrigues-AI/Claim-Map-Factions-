export class BackgroundRenderer {
  draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}
