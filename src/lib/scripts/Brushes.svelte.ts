import { bucketFill } from "./Bucket";
import type { CommandHandler } from "./CommandHandler";
import { RenderCommand } from "./Commands";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class Brush {
  name: string;
  usesSize: boolean;
  usesColor: boolean;
  commandHandler: CommandHandler;
  size: number = $state(0);
  color: string = $state("");
  hoverStyle: string;

  previousImageData?: ImageData;

  // Alter the brush's current size based on the parameter
  changeSize(change: number): void {
    if (this.usesSize) {
      this.size += change;

      // Enforce a minimum brush size of 1
      if (this.size < 1) this.size = 1;
    }
  }

  // Update the brush's current color (if it uses one)
  changeColor(color: string): void {
    if (this.usesColor) this.color = color;
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
    // Append new brush strokes to command timeline
    if (this.previousImageData) {
      const command = new RenderCommand(canvas, this.previousImageData);
      this.commandHandler.addCommand(command);
    }
  }

  constructor(
    name: string,
    usesSize: boolean,
    usesColor: boolean,
    commandHandler: CommandHandler,
    size: number,
    color: string,
    hoverStyle: string = ""
  ) {
    this.name = name;
    this.usesSize = usesSize;
    this.usesColor = usesColor;
    this.commandHandler = commandHandler;
    this.size = size;
    this.color = color;
    this.hoverStyle = hoverStyle;
  }
}

// Default paint brush
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
    context.lineWidth = this.size;
    context.strokeStyle = this.color;

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

  constructor(size: number, color: string, commandHandler: CommandHandler) {
    super(
      "Paint Brush",
      true,
      true,
      commandHandler,
      size,
      color,
      "rounded-full"
    );
  }
}

// Default Eraser
export class Eraser extends Brush {
  // Erase points on current canvas under mouse cursor
  erase(canvas: HTMLCanvasElement, x: number, y: number): void {
    const context = canvas.getContext("2d");
    context?.clearRect(x, y, this.size, this.size);
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

  constructor(size: number, commandHandler: CommandHandler) {
    super("Eraser", true, false, commandHandler, size, "", "border-2 bg-white");
  }
}

// Bucket Tool
export class Bucket extends Brush {
  success: boolean = false;

  // Attempt to flood fill all pixels with matching color, and store command on success
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.setPreviousImageData(canvas);
    if (bucketFill(canvas, x, y, this.color)) this.storeCommand(canvas);
  }

  constructor(commandHandler: CommandHandler) {
    super("Bucket", false, true, commandHandler, 12, "#000000");
  }
}
