import {
  Brush,
  Bucket,
  Eraser,
  EyeDropper,
  PaintBrush,
} from "./Brushes.svelte";

import { Color } from "./ColorTools.svelte";
import type { CommandHandler } from "./CommandHandler";

export class BrushHandler {
  // Tracks the currently selected brush
  brush: Brush | undefined = $state();

  paintBrush: PaintBrush;
  eraser: Eraser;
  bucket: Bucket;
  eyeDropper: EyeDropper;

  // Store selected color in BrushHandler so all brushes that use color have the same, universal color
  color: Color = $state(new Color(0, 0, 0, 255));

  // Store the background layer's color to allow the eye dropper to return it if nothing else is hit
  backgroundColor: Color = $state(new Color(255, 255, 255, 255));

  // Change currently selected brush
  setBrush(brush: Brush): void {
    this.brush = brush;

    // Ensure newly selected brush uses the universally selected color
    brush.changeColor(this.color);
  }

  // Applies universal color to brushes that need it, and serves as a controller for current brush's startDraw()
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    if (this.brush) {
      // Apply current universal color to brush (if it uses colors)
      if (this.brush.color) this.brush.color = this.color;

      // Call the brush's start draw functionality
      const output = this.brush.startDraw(canvas, x, y);

      // Allows eye dropper tool to work
      if (output != undefined) this.color = output;
    }
  }

  // Serves as a controller for current brush's draw()
  draw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.brush?.draw(canvas, x, y);
  }

  // Serves as a controller for current brush's endDraw()
  endDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.brush?.endDraw(canvas, x, y);
  }

  constructor(commandHandler: CommandHandler) {
    // Instantiate all the different brushes
    this.paintBrush = new PaintBrush(commandHandler, 3, this.color, 100);
    this.eraser = new Eraser(commandHandler, 8);
    this.bucket = new Bucket(commandHandler, this.color);
    this.eyeDropper = new EyeDropper(this.backgroundColor);

    // Initialize selected brush to be regular paint brush
    this.brush = this.paintBrush;
  }
}
