import { Command } from "$lib/classes/commands/Command";

// Handles rendering image data to screen
export class RenderCommand extends Command {
  constructor(canvas: HTMLCanvasElement, oldImageData: ImageData) {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const newImageData: ImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Define redo and undo functions
    super(
      function () {
        context.putImageData(newImageData, 0, 0);
      },
      function () {
        context.putImageData(oldImageData, 0, 0);
      }
    );
  }
}
