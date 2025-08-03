import { Tool } from "$lib/classes/Tool.svelte";
import { getColorHexXY, getColorXY } from "$lib/scripts/ColorTools";
import type LayerHandler from "../handlers/LayerHandler.svelte";

// Eye Dropper Tool
export class EyeDropper extends Tool {
  backgroundColor: string;

  // Returns the hex color value of clicked pixel (or of background if clear pixel is clicked)
  startUse(_layerHandler: LayerHandler, canvas: HTMLCanvasElement, x: number, y: number): string {
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
