import { Tool } from "$lib/classes/Tool.svelte";
import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";

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
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.storePreviousImageData(canvas);

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Apply stroke's current brush attributes before drawing out the stroke (if they are used)
    context.lineWidth = this.size;
    context.strokeStyle = this.color;
    context.globalAlpha = this.opacity / 255;

    // Applies brush's shape when
    if (this.isCircle) {
      context.lineCap = "round";
      context.lineJoin = "round";
    } else {
      context.lineCap = "square";
    }

    // Add initial points of brush stroke and draw out initial point
    this.brushStroke = [{ x: x + this.size / 2 - 2, y: y + this.size / 2 - 2 }];
    this.dragUse(canvas, x + 0.0001, y + 0.0001);
  }

  // Draws out canvas content from before the brush stroke and then draws out current brush stroke on top
  // Do it this way rather than just drawing every move allows for brush strokes of different opacities
  dragUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    // Grab canvas' current context
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    if (this.isCircle) {
      // Append new brush stroke points
      this.brushStroke.push({
        x: x + this.size / 2 - 2,
        y: y + this.size / 2 - 2,
      });

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
    } else {
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Erases based on currently selected shape
    if (this.isCircle) {
      context.save(); // Stores current clipping region to allow returning back to it after erase is handled
      context.beginPath();

      const offset = this.size / 2 - 2; // Ensures that the circle erase lines up with hover icon
      context.arc(x + offset, y + offset, this.size / 2, 0, 2 * Math.PI);

      context.clip(); // Prevents canvas manipulation outside of the clipped area
      context.clearRect(0, 0, canvas.width, canvas.height); // Only erases in clipped area
      context.restore(); // Restore back to saved state from before erase (reenables full canvas manipulation)
    } else {
      // Subtract by 2 to center the erase stroke
      context.clearRect(x - 2, y - 2, this.size, this.size);
    }
    }
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
    super("Paint Brush", commandHandler, size, color, opacity);

    // Apply correct hover style based on paint brush's initial shape
    this.hoverStyle = this.isCircle
      ? this.circleHoverStyle
      : this.squareHoverStyle;
  }
}
