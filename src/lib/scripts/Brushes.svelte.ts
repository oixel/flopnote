import { bucketFill } from "./Bucket";
import { getColorHexXY, getColorXY } from "./ColorTools";
import type { CommandHandler } from "./CommandHandler";
import { RenderCommand } from "./Commands";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class Brush {
  name: string;

  commandHandler?: CommandHandler;

  size: number | null = $state(null); // Optional: some brushes don't need a size (e.g. Bucket)
  maxSize: number = 100;

  color: string | null = $state(null); // Optional: some brushes don't need colors (e.g. Eraser)
  opacity: number | null = $state(null); // Optional: some brushes don't need opacity (e.g. Eye Dropper)

  cursor: string = "cursor-none"; // Sets the mouse cursor's icon while hovering over canvas
  hoverStyle?: string; // Appearance of brush while hovering over canvas

  previousImageData?: ImageData;

  // Alter the brush's current size based on the parameter
  changeSize(change: number): void {
    if (this.size) {
      this.size += change;

      // Enforce a minimum and maximum for the brush size
      if (this.size < 1) this.size = 1;
      else if (this.size > this.maxSize) this.size = this.maxSize;
    }
  }

  // Update the brush's current color (if it uses one)
  changeColor(color: string): void {
    if (this.color) this.color = color;
  }

  // Called when mouse is first clicked inside of the canvas
  startDraw(_canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Called when the mouse is clicked and moving around the canvas
  draw(_canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Called when mouse is released
  endDraw(_canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Grab image data BEFORE drawing, so it can be re-applied on RenderCommand's undo()
  setPreviousImageData(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    this.previousImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  // Append current draw command to the command timeline
  storeCommand(canvas: HTMLCanvasElement): void {
    if (this.previousImageData && this.commandHandler) {
      const command = new RenderCommand(canvas, this.previousImageData);
      this.commandHandler.addCommand(command);
    }
  }

  constructor(
    name: string,
    commandHandler?: CommandHandler,
    size: number | null = null,
    color: string | null = null,
    opacity: number | null = null,
    hoverStyle?: string
  ) {
    this.name = name;

    this.commandHandler = commandHandler;
    this.size = size;
    this.color = color;
    this.opacity = opacity;
    this.hoverStyle = hoverStyle;
  }
}

// Default Paint Brush
export class PaintBrush extends Brush {
  prevX: number = 0;
  prevY: number = 0;

  brushStroke: Array<{ x: number; y: number }> = [];

  // Grab current image data and apply initial points of brush stroke
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.setPreviousImageData(canvas);

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Apply stroke's current brush attributes before drawing out the stroke (if they are used)
    if (this.size) context.lineWidth = this.size;
    if (this.color) context.strokeStyle = this.color;
    if (this.opacity) context.globalAlpha = this.opacity / 255;

    // Ensure that the brush is round
    context.lineCap = "round";
    context.lineJoin = "round";

    // Add initial points of brush stroke and draw out initial point
    this.brushStroke = [{ x, y }];
    this.draw(canvas, x + 0.0001, y + 0.0001);

    console.log("START");
  }

  // Draws out canvas content from before the brush stroke and then draws out current brush stroke on top
  // Do it this way rather than just drawing every move allows for brush strokes of different opacities
  draw(canvas: HTMLCanvasElement, x: number, y: number): void {
    // Append new brush stroke points
    this.brushStroke.push({ x, y });

    // Grab canvas' current context
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Redraw canvas' previous content back onto it
    if (this.previousImageData)
      context.putImageData(this.previousImageData, 0, 0);

    // Draw out the current brush stroke's line data on top of previous content
    context.beginPath();
    for (let i = 1; i < this.brushStroke.length; i++) {
      context.moveTo(this.brushStroke[i-1].x, this.brushStroke[i-1].y);
      context.lineTo(this.brushStroke[i].x, this.brushStroke[i].y);
    }

    // Fill brush stroke's path!
    context.stroke();
  }

  // Store canvas' new state in command time line for redo()
  endDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
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

// Default Eraser
export class Eraser extends Brush {
  // Erase points on current canvas under mouse cursor
  erase(canvas: HTMLCanvasElement, x: number, y: number): void {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(x, y, this.size as number, this.size as number);
  }

  // Erase initial points under mouse
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.setPreviousImageData(canvas);
    this.erase(canvas, x, y);
  }

  // Erase under mouse as it gets moved
  draw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.erase(canvas, x, y);
  }

  // Erase final points when mouse is released and store erase command
  endDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.erase(canvas, x, y);
    this.storeCommand(canvas);
  }

  constructor(commandHandler: CommandHandler, size: number) {
    super("Eraser", commandHandler, size);
    this.hoverStyle = "border-2 bg-white";
  }
}

// Bucket Tool
export class Bucket extends Brush {
  success: boolean = false;

  // Attempt to flood fill all pixels with matching color, and store command on success
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.setPreviousImageData(canvas);
    if (bucketFill(canvas, x, y, this.color as string))
      this.storeCommand(canvas);
  }

  constructor(commandHandler: CommandHandler, color: string) {
    super("Bucket", commandHandler);
    this.color = color;
    this.hoverStyle = "w-5 h-5";
  }
}

// Eye Dropper Tool
export class EyeDropper extends Brush {
  backgroundColor: string;

  // Returns the hex color value of clicked pixel (or of background if clear pixel is clicked)
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): string {
    // Return clicked color if it is not clear
    if (getColorXY(canvas, x, y).a != 0) return getColorHexXY(canvas, x, y);

    // Otherwise, return background color if a clear pixel was clicked
    return this.backgroundColor;
  }

  constructor(backgroundColor: string) {
    super("Eye Dropper");
    this.backgroundColor = backgroundColor;
    this.cursor = `cursor-crosshair`;
  }
}
