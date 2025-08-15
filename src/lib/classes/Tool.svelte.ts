/* eslint-disable @typescript-eslint/no-unused-vars */

import { RenderCommand } from "./commands/RenderCommand";
import type { CommandHandler } from "./handlers/CommandHandler";
import type LayerHandler from "./handlers/LayerHandler.svelte";

// Base class for all tools
export class Tool {
  name: string;

  commandHandler?: CommandHandler;

  size: number = $state(0); // Optional: some tools don't need a size (e.g. Bucket)
  maxSize: number = 100;

  color: string = $state(""); // Optional: some tools don't need colors (e.g. Eraser)
  opacity: number = $state(0); // Optional: some tools don't need opacity (e.g. Eye Dropper)

  cursor: string = "cursor-none"; // Sets the mouse cursor's icon while hovering over canvas
  hoverStyle: string = $state(""); // Appearance of tool while hovering over canvas

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

  // Allows tools such as the paint brush and eraser to toggle between circular and square shapes
  toggleShape(): void {
    return;
  }

  // Called when mouse is first clicked inside of the canvas
  startUse(_layerHandler: LayerHandler, _canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Called when the mouse is clicked and moving around the canvas
  dragUse(_layerHandler: LayerHandler, _canvas: HTMLCanvasElement, _x: number, _y: number): void {
    return;
  }

  // Called when mouse is released
  endUse(_layerHandler: LayerHandler, _canvas: HTMLCanvasElement, _x: number, _y: number): void {
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
  storeCommand(layerHandler: LayerHandler, canvas: HTMLCanvasElement): void {
    if (this.previousImageData && this.commandHandler) {
      const command = new RenderCommand(layerHandler, canvas, this.previousImageData);
      this.commandHandler.addCommand(command);

      layerHandler.updateKey(layerHandler.activeLayerIndex);
    }
  }

  constructor(
    name: string,
    commandHandler?: CommandHandler,
    size: number = 0,
    color: string = "",
    opacity: number = 0,
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
