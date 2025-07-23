import { bucketFill } from "./Bucket";
import { getColor, getColorHex } from "./ColorTools";
import type { CommandHandler } from "./CommandHandler";
import { RenderCommand } from "./Commands";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class Brush {
  name: string;

  commandHandler?: CommandHandler;

  size?: number = $state(undefined);  // Optiona: some brushes don't need a size (e.g. Bucket)
  maxSize: number = 100;

  color?: string = $state(undefined);  // Optional: some brushes don't need colors (e.g. Eraser)

  cursor: string = "cursor-none";  // Sets the mouse cursor's icon while hovering over canvas
  hoverStyle?: string;  // Appearance of brush while hovering over canvas

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
    size?: number,
    color?: string,
    hoverStyle?: string
  ) {
    this.name = name;

    this.commandHandler = commandHandler;
    this.size = size;
    this.color = color;
    this.hoverStyle = hoverStyle;
  }
}

// Default Paint Brush
export class PaintBrush extends Brush {
  prevX: number = 0;
  prevY: number = 0;

  // Grab current image data and apply initial points of brush stroke
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.setPreviousImageData(canvas);

    // Apply a very miniscule difference so that initial "line" can be drawn
    this.prevX = x + 0.0001;
    this.prevY = y + 0.0001;

    // Add initial points of brush stroke to canvas by cheesing the canvas `lineTo()` function (allows for dots)
    this.draw(canvas, x, y);
  }

  // Draw a line stroke from the previous mouse position to the current mouse position
  draw(canvas: HTMLCanvasElement, x: number, y: number): void {
    // Grab canvas' current context
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Apply stroke's current brush attributes before drawing out the stroke
    context.lineWidth = this.size as number;
    context.strokeStyle = this.color as string;

    // Ensure that the brush is round
    context.lineCap = "round";

    // Draw out the brush stroke!
    context.beginPath();
    context.moveTo(this.prevX, this.prevY);
    context.lineTo(x, y);
    context.stroke();

    this.prevX = x;
    this.prevY = y;
  }

  // Add final points of brush stroke to canvas when mouse is released and store command
  endDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.draw(canvas, x, y);
    this.storeCommand(canvas);
  }

  constructor(commandHandler: CommandHandler, size: number, color: string) {
    super("Paint Brush", commandHandler, size, color, "rounded-full");
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
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ) as ImageData;
    const coord = (y * canvas.width + x) * 4;
    console.log(imageData.data[coord]);

    // Return clicked color if it is not clear
    if (getColor(imageData, coord).a != 0) return getColorHex(imageData, coord);

    // Return background color if a clear pixel was clicked
    return this.backgroundColor;
  }

  constructor(backgroundColor: string) {
    super("Eye Dropper");
    this.backgroundColor = backgroundColor;
    this.cursor = `cursor-crosshair`;
  }
}
