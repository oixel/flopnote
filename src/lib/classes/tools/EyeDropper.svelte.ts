import { Tool } from "$lib/classes/Tool.svelte";
import { getPixelCoord, getColor, getColorHex } from "$lib/scripts/ColorTools";
import type LayerHandler from "../handlers/LayerHandler.svelte";

// Eye Dropper Tool
export class EyeDropper extends Tool {
  backgroundColor: string;

  // Returns the hex color value of clicked pixel (or of background if clear pixel is clicked)
  startUse(layerHandler: LayerHandler, canvas: HTMLCanvasElement, x: number, y: number): string {
    // Convert clicked position into index for ImageData array
    const coord: number = getPixelCoord(canvas.width, x, y);

    // Return clicked color on first layer that has a non-empty pixel
    for (let i = layerHandler.layers.length - 1; i >= 0; i--) {
      const imageData = layerHandler.layers[i].imageData;
      if (getColor(imageData, coord).a != 0)
        return getColorHex(imageData, coord);
    }

    // Otherwise, if no color is found on ANY layer, return background color since an empty pixel was clicked
    return this.backgroundColor;
  }

  constructor(backgroundColor: string) {
    super("Eye Dropper");
    this.backgroundColor = backgroundColor;
    this.cursor = `cursor-crosshair`;
  }
}
