import { Tool } from "$lib/classes/Tool.svelte";
import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";

// Default Eraser
export class Eraser extends Tool {
  // Erase points on current canvas under mouse cursor
  erase(canvas: HTMLCanvasElement, x: number, y: number): void {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(x, y, this.size as number, this.size as number);
  }

  // Erase initial points under mouse
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.storePreviousImageData(canvas);
    this.erase(canvas, x, y);
  }

  // Erase under mouse as it gets moved
  dragUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.erase(canvas, x, y);
  }

  // Erase final points when mouse is released and store erase command
  endUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.erase(canvas, x, y);
    this.storeCommand(canvas);
  }

  constructor(commandHandler: CommandHandler, size: number) {
    super("Eraser", commandHandler, size);
    this.hoverStyle = "border-2 bg-white";
  }
}
