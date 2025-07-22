export class Command {
  redo: VoidFunction;
  undo: VoidFunction;

  constructor(redo: VoidFunction, undo: VoidFunction) {
    this.redo = redo;
    this.undo = undo;
  }
}

// Handles rendering image data to screen
export class RenderCommand extends Command {
  context: CanvasRenderingContext2D;
  oldImageData: ImageData;

  constructor(
    canvas: HTMLCanvasElement,
    oldImageData: ImageData,
  ) {

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const newImageData: ImageData = context.getImageData(0, 0, canvas.width, canvas.height);

    super(
      function () {
        context.putImageData(newImageData, 0, 0);
      },
      function () {
        context.putImageData(oldImageData, 0, 0)
      }
    );

    // 
    this.context = context;
    this.oldImageData = oldImageData;
  }
}
