import { Tool } from "$lib/classes/Tool.svelte";
import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";

// Default Eraser
export class Eraser extends Tool {
  private prevX: number | null = null;
  private prevY: number | null = null;

  private isCircle: boolean = $state(true);
  private circleHoverStyle: string = "bg-white border-1 rounded-full";
  private squareHoverStyle: string = "bg-white border-1";

  // Clear canvas' pixel colors within current shape at given position
  erase(canvas: HTMLCanvasElement, x: number, y: number): void {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const size = this.size as number;

    // Erases based on currently selected shape
    if (this.isCircle) {
      context.save(); // Stores current clipping region to allow returning back to it after erase is handled
      context.beginPath();

      const offset = size / 2 - 2; // Ensures that the circle erase lines up with hover icon (-2 due to hover style's border)
      context.arc(x + offset, y + offset, size / 2, 0, 2 * Math.PI);

      context.clip(); // Prevents canvas manipulation outside of the clipped area
      context.clearRect(0, 0, canvas.width, canvas.height); // Only erases in clipped area
      context.restore(); // Restore back to saved state from before erase (reenables full canvas manipulation)
    } else {
      // Subtract by 2 to center the erase stroke by accounting for hover style's border
      context.clearRect(x - 2, y - 2, size, size);
    }
  }

  eraseStroke(
    canvas: HTMLCanvasElement,
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): void {
    // Use the distance formula to determine the distance between the previous brush stroke point and the current
    const distance = Math.hypot(x1 - x0, y1 - y0);

    // Determine how many points are needed based on the eraser's current size.
    const steps = Math.ceil(distance / ((this.size as number) / 2));

    // Erase all points from previous brush stroke point to current
    for (let i = 0; i <= steps; i++) {
      const interpolation = i / steps;
      const x = x0 + (x1 - x0) * interpolation;
      const y = y0 + (y1 - y0) * interpolation;

      // Call eraser subclass' specific erase functionality
      this.erase(canvas, x, y);
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
