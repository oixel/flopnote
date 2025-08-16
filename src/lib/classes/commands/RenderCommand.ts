import { Command } from "$lib/classes/commands/Command";
import type LayerHandler from "../handlers/LayerHandler.svelte";

// Handles rendering image data to screen
export class RenderCommand extends Command {
  constructor(layerHandler: LayerHandler, canvas: HTMLCanvasElement, oldImageData: ImageData) {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const newImageData: ImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Grab the affect layer's index, to undo / redo at the *current* layer (and not whichever is active when command is called)
    const activeLayerIndex = layerHandler.activeLayerIndex;

    // Define redo and undo functions
    super(
      // Redo
      function () {
        context.putImageData(newImageData, 0, 0);
        layerHandler.layers[activeLayerIndex].imageData = newImageData;
      },
      // Undo
      function () {
        context.putImageData(oldImageData, 0, 0);
        layerHandler.layers[activeLayerIndex].imageData = oldImageData;
      }
    );
  }
}
