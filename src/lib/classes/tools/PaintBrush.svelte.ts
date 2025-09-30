import { Tool } from "$lib/classes/Tool.svelte";
import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";
import { interpolate } from "$lib/scripts/BrushTools";
import type LayerHandler from "../handlers/LayerHandler.svelte";

// Default Paint Brush
export class PaintBrush extends Tool {
  private brushStroke: Array<{ x: number; y: number }> = [];

  private isCircle = $state(true);
  private circleHoverStyle = "rounded-full";
  private squareHoverStyle = "";

  // Toggle paint brush between a circular and square shape
  toggleShape(): void {
    this.isCircle = !this.isCircle;

    // Update paint brush's hover style to reflect current brush shape
    this.hoverStyle = this.isCircle
      ? this.circleHoverStyle
      : this.squareHoverStyle;
  }

  // Grab current image data and apply initial points of brush stroke
  startUse(layerHandler: LayerHandler, canvas: HTMLCanvasElement, x: number, y: number): void {
    this.storePreviousImageData(canvas);

    const context = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

    // Update brush's update
    context.globalAlpha = this.opacity / 255;

    // Update current brush's attributes for circular brush
    context.lineWidth = this.size;
    context.strokeStyle = this.color;
    context.lineCap = "round";
    context.lineJoin = "round";

    // Ensure square brush fills the current color
    context.fillStyle = this.color;

    // Add initial points of brush stroke and draw out initial point
    this.brushStroke = [{ x: x + this.size / 2 - 2, y: y + this.size / 2 - 2 }];
    this.dragUse(layerHandler, canvas, x + 0.0001, y + 0.0001);
  }

  // Draws out canvas content from before the brush stroke and then draws out current brush stroke on top
  // Do it this way rather than just drawing every move allows for brush strokes of different opacities
  dragUse(_layerHandler: LayerHandler, canvas: HTMLCanvasElement, x: number, y: number): void {
    // Grab canvas' current context
    const context = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

    // Append new brush stroke points
    this.brushStroke.push({
      x: x + this.size / 2 - 2,
      y: y + this.size / 2 - 2,
    });

    // Redraw canvas' previous content back onto it
    if (this.previousImageData)
      context.putImageData(this.previousImageData, 0, 0);

    // Start drawing the brush stroke's path
    context.beginPath();

    // Circular brush simply draws lines from each point of brush stroke while square brush creates a rect shape before filling it out
    if (this.isCircle) {
      // Draw out the current brush stroke's line data on top of previous content
      for (let i = 1; i < this.brushStroke.length; i++) {
        context.moveTo(this.brushStroke[i - 1].x, this.brushStroke[i - 1].y);
        context.lineTo(this.brushStroke[i].x, this.brushStroke[i].y);
      }

      // Then draw out the brush stroke
      context.stroke();
    } else {
      // Get interpolated brush stroke to prevent brush skipping
      const interpolatedPoints = interpolate(this.brushStroke, this.size);

      // Then draw out a square shape at each point of the brush stroke
      for (const point of interpolatedPoints) {
        context.rect(
          point.x - this.size / 2,
          point.y - this.size / 2,
          this.size,
          this.size
        );
      }

      // Then fill the created shape! (Doing a singular fill preserves the brush's opacity)
      context.fill();
    }
  }

  // Store canvas' new state in command time line for redo()
  endUse(layerHandler: LayerHandler, canvas: HTMLCanvasElement): void {
    this.storeCommand(layerHandler, canvas);
  }

  constructor(
    commandHandler: CommandHandler,
    size: number,
    color: string,
    opacity: number
  ) {
    super("Paint Brush", commandHandler, size, color, opacity);

    // Apply correct hover style based on paint brush's initial shape
    this.hoverStyle = this.isCircle
      ? this.circleHoverStyle
      : this.squareHoverStyle;
  }
}
