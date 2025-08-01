import { Tool } from "$lib/classes/Tool.svelte";
import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";

// Default Paint Brush
export class PaintBrush extends Tool {
  prevX: number = 0;
  prevY: number = 0;

  brushStroke: Array<{ x: number; y: number }> = [];

  // Grab current image data and apply initial points of brush stroke
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.storePreviousImageData(canvas);

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Apply stroke's current brush attributes before drawing out the stroke (if they are used)
    context.lineWidth = this.size;
    context.strokeStyle = this.color;
    context.globalAlpha = this.opacity / 255;

    // Ensure that the brush is round
    context.lineCap = "round";
    context.lineJoin = "round";

    // Add initial points of brush stroke and draw out initial point
    this.brushStroke = [{ x: x + this.size / 2 - 2, y: y + this.size / 2 - 2 }];
    this.dragUse(canvas, x + 0.0001, y + 0.0001);
  }

  // Draws out canvas content from before the brush stroke and then draws out current brush stroke on top
  // Do it this way rather than just drawing every move allows for brush strokes of different opacities
  dragUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    // Append new brush stroke points
    this.brushStroke.push({
      x: x + this.size / 2 - 2,
      y: y + this.size / 2 - 2,
    });

    // Grab canvas' current context
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Redraw canvas' previous content back onto it
    if (this.previousImageData)
      context.putImageData(this.previousImageData, 0, 0);

    // Draw out the current brush stroke's line data on top of previous content
    context.beginPath();
    for (let i = 1; i < this.brushStroke.length; i++) {
      context.moveTo(this.brushStroke[i - 1].x, this.brushStroke[i - 1].y);
      context.lineTo(this.brushStroke[i].x, this.brushStroke[i].y);
    }

    // Fill brush stroke's path!
    context.stroke();
  }

  // Store canvas' new state in command time line for redo()
  endUse(canvas: HTMLCanvasElement): void {
    this.storeCommand(canvas);
  }

  constructor(
    commandHandler: CommandHandler,
    size: number,
    color: string,
    opacity: number
  ) {
    super("Paint Brush", commandHandler, size, color, opacity, "rounded-full");
  }
}
