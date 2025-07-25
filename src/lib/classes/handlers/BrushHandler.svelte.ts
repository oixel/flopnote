import type { Tool } from "$lib/classes/Tool.svelte";
import { Bucket } from "$lib/classes/tools/Bucket.svelte";
import { Eraser } from "$lib/classes/tools/Eraser.svelte";
import { EyeDropper } from "$lib/classes/tools/EyeDropper.svelte";
import { PaintBrush } from "$lib/classes/tools/PaintBrush.svelte";
import { CommandHandler } from "$lib/classes/handlers/CommandHandler";

export class BrushHandler {
  // Tracks the currently selected brush
  brush: Tool | undefined = $state();

  // All the different tool options
  paintBrush: PaintBrush;
  eraser: Eraser;
  bucket: Bucket;
  eyeDropper: EyeDropper;

  // Store selected color in BrushHandler so all brushes that use color have the same, universal color
  color: string = $state("#000000");
  recentColors: Array<string> = $state([]);

  // Store the background layer's color to allow the eye dropper to return it if nothing else is hit
  backgroundColor: string = $state("#ffffff");

  // Change currently selected brush
  setBrush(brush: Tool): void {
    this.brush = brush;

    // Ensure newly selected brush uses the universally selected color
    if (brush.color) brush.color = this.color;
  }

  // Append any NEW, used color to the array of recent colors
  addColorToRecent(color: string): void {
    if (!this.recentColors.includes(color)) {
      this.recentColors.unshift(color);
      this.recentColors.splice(5);
    }
  }

  // Applies universal color to brushes that need it, and serves as a controller for current brush's startDraw()
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    if (this.brush) {
      // Apply current universal color to brush (if it uses colors) and append the used color to array of recent (if it isn't already in the array)
      if (this.brush.color) {
        this.brush.color = this.color;
        this.addColorToRecent(this.color);
      }

      // Call the brush's start draw functionality
      const output = this.brush.startUse(canvas, x, y);

      // Allows eye dropper tool to work
      if (typeof output === "string") this.color = output;
    }
  }

  // Serves as a controller for current brush's draw()
  dragUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.brush?.dragUse(canvas, x, y);
  }

  // Serves as a controller for current brush's endDraw()
  endUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.brush?.endUse(canvas, x, y);
  }

  constructor(commandHandler: CommandHandler) {
    // Instantiate all the different brushes
    this.paintBrush = new PaintBrush(commandHandler, 3, this.color, 255);
    this.eraser = new Eraser(commandHandler, 8);
    this.bucket = new Bucket(commandHandler, this.color, 10);
    this.eyeDropper = new EyeDropper(this.backgroundColor);

    // Initialize selected brush to be regular paint brush
    this.brush = this.paintBrush;
  }
}
