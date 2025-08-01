import type { Tool } from "$lib/classes/Tool.svelte";
import { Bucket } from "$lib/classes/tools/Bucket.svelte";
import { Eraser } from "$lib/classes/tools/Eraser.svelte";
import { EyeDropper } from "$lib/classes/tools/EyeDropper.svelte";
import { PaintBrush } from "$lib/classes/tools/PaintBrush.svelte";
import { CommandHandler } from "$lib/classes/handlers/CommandHandler";

export class ToolHandler {
  // Tracks the currently selected tool
  tool: Tool | undefined = $state();

  // All the different tool options
  paintBrush: PaintBrush;
  eraser: Eraser;
  bucket: Bucket;
  eyeDropper: EyeDropper;

  // Store selected color in ToolHandler so all tools that use color have the same, universal color
  color: string = $state("#000000");
  recentColors: Array<string> = $state([]);

  // Store the background layer's color to allow the eye dropper to return it if nothing else is hit
  backgroundColor: string = $state("#ffffff");

  // Change currently selected tool
  setTool(tool: Tool): void {
    this.tool = tool;

    // Ensure newly selected tool uses the universally selected color
    if (tool.color) tool.color = this.color;
  }

  // Toggles the currently selected tool's shape (if it has alternate shapes)
  toggleToolShape(): void {
    this.tool?.toggleShape();
  }

  // Append any NEW, used color to the array of recent colors
  addColorToRecent(color: string): void {
    // Avoid updating array if the color has not changed
    if (this.recentColors[0] == color) return;

    // If color is already exists in the array, remove it so it shows up at the beginning instead
    if (this.recentColors.includes(color))
      this.recentColors.splice(this.recentColors.indexOf(color), 1);

    this.recentColors.unshift(color); // Add color to beginning of array
    this.recentColors.splice(5); // Remove any colors that go beyond the limit of 5
  }

  // Applies universal color to tools that need it, and serves as a controller for current tool's startUse()
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    if (this.tool) {
      // Apply current universal color to tool (if it uses colors) and attempt to append the used color to array of recent
      if (this.tool.color) {
        this.tool.color = this.color;
        this.addColorToRecent(this.color);
      }

      // Call the tool's start functionality
      const output = this.tool.startUse(canvas, x, y);

      // Allows eye dropper tool to work
      if (typeof output === "string") this.color = output;
    }
  }

  // Serves as a controller for current tool's dragUse()
  dragUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.tool?.dragUse(canvas, x, y);
  }

  // Serves as a controller for current tool's endUse()
  endUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.tool?.endUse(canvas, x, y);
  }

  constructor(commandHandler: CommandHandler) {
    // Instantiate all the different tools
    this.paintBrush = new PaintBrush(commandHandler, 3, this.color, 255);
    this.eraser = new Eraser(commandHandler, 8);
    this.bucket = new Bucket(commandHandler, this.color, 10);
    this.eyeDropper = new EyeDropper(this.backgroundColor);

    // Initialize selected tool to be regular paint brush
    this.tool = this.paintBrush;
  }
}
