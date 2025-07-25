/* eslint-disable @typescript-eslint/no-unused-vars */

import { RenderCommand } from "./commands/RenderCommand";
import type { CommandHandler } from "./handlers/CommandHandler";

// Base class for all tools
export class Tool {
  name: string;

  commandHandler?: CommandHandler;

  size: number | null = $state(null); // Optional: some tools don't need a size (e.g. Bucket)
  maxSize: number = 100;

  color: string | null = $state(null); // Optional: some tools don't need colors (e.g. Eraser)
  opacity: number | null = $state(null); // Optional: some tools don't need opacity (e.g. Eye Dropper)

  cursor: string = "cursor-none"; // Sets the mouse cursor's icon while hovering over canvas
  hoverStyle: string; // Appearance of tool while hovering over canvas

  previousImageData?: ImageData;

  // Alter the tool's current size based on the parameter
  alterSize(change: number): void {
    if (this.size) {
      this.size += change;

      // Enforce a minimum and maximum for the tool size
      if (this.size < 1) this.size = 1;
      else if (this.size > this.maxSize) this.size = this.maxSize;
    }
  }

  // Called when mouse is first clicked inside of the canvas
  startUse(_canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Called when the mouse is clicked and moving around the canvas
  dragUse(_canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Called when mouse is released
  endUse(_canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Grab image data BEFORE using tool to allow for RenderCommand's undo()
  storePreviousImageData(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    this.previousImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  // Append canvas changes to the command timeline
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
    hoverStyle: string = ""
  ) {
    this.name = name;

    this.commandHandler = commandHandler;
    this.size = size;
    this.color = color;
    this.opacity = opacity;
    this.hoverStyle = hoverStyle;
  }
}
