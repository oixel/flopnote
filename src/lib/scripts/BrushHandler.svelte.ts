import { Brush, Bucket, Eraser, PaintBrush } from "./Brushes.svelte";
import type { CommandHandler } from "./CommandHandler";

export class BrushHandler {
  // Tracks the currently selected brush
  brush: Brush | undefined = $state();

  paintBrush: PaintBrush;
  eraser: Eraser;
  bucket: Bucket;

  // Change currently selected brush
  setBrush(brush: Brush): void {
    this.brush = brush;
  }

  constructor(commandHandler: CommandHandler) {
    // Instantiate all the different brushes
    this.paintBrush = new PaintBrush(3, "#000000", commandHandler);
    this.eraser = new Eraser(8, commandHandler);
    this.bucket = new Bucket(commandHandler);

    // Initialize selected brush to be regular paint brush
    this.brush = this.paintBrush;
  }
}
