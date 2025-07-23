import type { CommandHandler } from "./CommandHandler";
import { RenderCommand } from "./Commands";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class Brush {
  name: string;
  size: number = $state(0);
  color: string = $state("");
  hoverStyle: string;
  commandHandler: CommandHandler;

  // Alter the brush's current size based on the parameter
  changeSize(change: number): void {
    this.size += change;

    // Enforce a minimum brush size of 1
    if (this.size < 1) this.size = 1;
  }

  // Update the brush's current color
  setColor(color: string): void {
    this.color = color;
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

  constructor(
    name: string,
    size: number,
    color: string,
    hoverStyle: string = "",
    commandHandler: CommandHandler
  ) {
    this.name = name;
    this.size = size;
    this.color = color;
    this.hoverStyle = hoverStyle;
    this.commandHandler = commandHandler;
  }
}

export class PaintBrush extends Brush {
  prevX: number = 0;
  prevY: number = 0;
  previousImageData?: ImageData;


  // Grab current image data and apply initial points of brush stroke
  startDraw(canvas: HTMLCanvasElement, x: number, y: number): void {
    // Grab image data BEFORE this brush stroke, so it can be re-applied on RenderCommand's undo()
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.previousImageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Apply a very miniscule difference so that initial "line" can be drawn
    this.prevX = x + 0.0001;
    this.prevY = y + 0.0001;

    // Add initial points of brush stroke to canvas by cheesing the canvas `lineTo()` function (allows for dots)
    this.draw(canvas, x, y);
  }

  // Draw a line stroke from the previous mouse position to the current mouse position
  draw(canvas: HTMLCanvasElement, x: number, y: number): void {
    // Grab canvas' current context
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

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

  // Add final points of brush stroke to canvas when mouse is released
  endDraw(canvas: HTMLCanvasElement, x: number, y: number) {
    this.draw(canvas, x, y);
    
    // Append new brush strokes to command timeline
    if (this.previousImageData){
      const command = new RenderCommand(canvas, this.previousImageData);
      this.commandHandler.addCommand(command);
    }
  }

  constructor(size: number, color: string, commandHandler: CommandHandler) {
    super("Paint Brush", size, color, "rounded-full", commandHandler);
  }
}
