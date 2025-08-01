import { Tool } from "$lib/classes/Tool.svelte";
import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";
import { interpolate } from "$lib/scripts/BrushTools";

// Default Eraser
export class Eraser extends Tool {
  private prevX: number | null = null;
  private prevY: number | null = null;

  private isCircle: boolean = $state(false);
  private circleHoverStyle: string = "bg-white border-1 rounded-full";
  private squareHoverStyle: string = "bg-white border-1";

  // Clear canvas' pixel colors within current shape at given position
  erase(canvas: HTMLCanvasElement, x: number, y: number): void {
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

  eraseStroke(
    canvas: HTMLCanvasElement,
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): void {
    const brushStroke = [{x: x0, y: y0}, {x: x1, y: y1}];
    const interpolatedPoints = interpolate(brushStroke, this.size);
    for (const point of interpolatedPoints) {
      this.erase(canvas, point.x, point.y);
    }
  }

  // Toggles the eraser from a circle to square
  toggleShape(): void {
    this.isCircle = !this.isCircle;

    // Updates the eraser's hover style to reflect shape change
    this.hoverStyle = this.isCircle
      ? this.circleHoverStyle
      : this.squareHoverStyle;
  }

  // Called whenever the mouse is first clicked on canvas
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    // Store initial canvas image data to allow for undo functionality
    this.storePreviousImageData(canvas);

    // Erase initial clicked position
    this.dragUse(canvas, x, y);
  }

  // Erase under mouse as it gets moved
  dragUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    // If a stroke, erase the stroke, otherwise erase current, singular point
    if (this.prevX !== null && this.prevY !== null) {
      this.eraseStroke(canvas, this.prevX, this.prevY, x, y);
    } else this.erase(canvas, x, y);

    this.prevX = x;
    this.prevY = y;
  }

  // Erase final points when mouse is released and store erase command
  endUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.dragUse(canvas, x, y);
    this.storeCommand(canvas);
    this.prevX = null;
    this.prevY = null;
  }

  constructor(commandHandler: CommandHandler, size: number) {
    super("Eraser", commandHandler, size);

    // Initialize eraser's hover style to initial shape
    this.hoverStyle = this.isCircle
      ? this.circleHoverStyle
      : this.squareHoverStyle;
  }
}
