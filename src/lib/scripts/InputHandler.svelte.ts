import type { BrushHandler } from "./BrushHandler.svelte";
import type { CommandHandler } from "./CommandHandler";

export class InputHandler {
  commandHandler: CommandHandler;
  brushHandler: BrushHandler;

  // Stores all the keys currently being pressed
  pressedKeys: Array<string> = [];

  // Handles all keybindings
  onkeydown(event: KeyboardEvent) {
    // Lowercase the key input to prevent issues when Caps-Lock is on
    const keycode = event.key.toLowerCase();

    // Add newly pressed key to array of all currently pressed keys
    this.pressedKeys.push(keycode);

    if (event.ctrlKey) {
      switch (keycode) {
        case "z":
          // Allows for undo and redo with Ctrl+Z and Ctrl+Shift+Z
          if (!event.shiftKey) this.commandHandler.undo();
          else this.commandHandler.redo();
          break;
        case "y":
          // Allows for redo functionality with Ctrl+Y
          this.commandHandler.redo();
          break;
      }
    } else {
      switch (keycode) {
        // Enables brush with 'b'
        case "b":
          this.brushHandler.setBrush(this.brushHandler.paintBrush);
          break;
        // Enables eraser with 'e'
        case "e":
          this.brushHandler.setBrush(this.brushHandler.eraser);
          break;
        // Enables bucket with 'g'
        case "g":
          this.brushHandler.setBrush(this.brushHandler.bucket);
          break;
        // Increases current brush/eraser size with up arrow
        case "arrowup":
          this.brushHandler.brush?.changeSize(1);
          break;
        // Decreases current brush/eraser size with down arrow
        case "arrowdown":
          this.brushHandler.brush?.changeSize(-1);
          break;
      }
    }
  }

  // Remove any released keys from list of currently pressed keys
  onkeyup(event: KeyboardEvent) {
    const keyIndex = this.pressedKeys.indexOf(event.key.toLowerCase());
    this.pressedKeys.splice(keyIndex, 1);
  }

  // Handles functionality with mouse scroll wheel
  onwheel(event: WheelEvent) {
    if (this.pressedKeys.includes("control")) {
      // Allows for Ctrl+Scroll to change brush size (if brush uses size)
      if (event.deltaY > 0) this.brushHandler.brush?.changeSize(1);
      else this.brushHandler.brush?.changeSize(-1);
    }
  }

  constructor(commandHandler: CommandHandler, brushHandler: BrushHandler) {
    this.commandHandler = commandHandler;
    this.brushHandler = brushHandler;
  }
}
