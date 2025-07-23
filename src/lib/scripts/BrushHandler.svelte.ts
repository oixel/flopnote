import { Brush, Bucket, Eraser, PaintBrush } from "./Brushes.svelte";
import type { CommandHandler } from "./CommandHandler";

export class BrushHandler {
  // Tracks the currently selected brush
  brush: Brush | undefined = $state();

  paintBrush: PaintBrush;
  eraser: Eraser;
  bucket: Bucket;

  // Store selected color in BrushHandler so all brushes that use color have the same, universal color
  color: string = $state("#000000");

  // Change currently selected brush
  setBrush(brush: Brush): void {
    this.brush = brush;

    // Ensure newly selected brush uses the universally selected color
    brush.changeColor(this.color);
  }

  //
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    if (this.brush) {
      this.brush.color = this.color;
      this.brush?.startDraw(canvas, x, y);
    }
  }

  //
  draw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.brush?.draw(canvas, x, y);
  }

  //
  endDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.brush?.endDraw(canvas, x, y);
  }

  constructor(commandHandler: CommandHandler) {
    // Instantiate all the different brushes
    this.paintBrush = new PaintBrush(3, this.color, commandHandler);
    this.eraser = new Eraser(8, commandHandler);
    this.bucket = new Bucket(commandHandler);

    // Initialize selected brush to be regular paint brush
    this.brush = this.paintBrush;
  }
}
