import type { ToolHandler } from "$lib/classes/handlers/ToolHandler.svelte";
import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";

export class InputHandler {
  commandHandler: CommandHandler;
  toolHandler: ToolHandler;

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
        // Enables paint brush with 'b'
        case "b":
          this.toolHandler.setTool(this.toolHandler.paintBrush);
          break;
        // Enables eraser with 'e'
        case "e":
          this.toolHandler.setTool(this.toolHandler.eraser);
          break;
        // Enables bucket with 'g'
        case "g":
          this.toolHandler.setTool(this.toolHandler.bucket);
          break;
        // Enables eye dropper with 'i'
        case "i":
          this.toolHandler.setTool(this.toolHandler.eyeDropper);
          break;
        // Increases current tool size with up arrow
        case "arrowup":
          this.toolHandler.tool?.alterSize(1);
          break;
        // Decreases current tool size with down arrow
        case "arrowdown":
          this.toolHandler.tool?.alterSize(-1);
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
      // Allows for Ctrl+Scroll to change tool size (if tool uses size)
      if (event.deltaY > 0) this.toolHandler.tool?.alterSize(1);
      else this.toolHandler.tool?.alterSize(-1);
    }
  }

  constructor(commandHandler: CommandHandler, toolHandler: ToolHandler) {
    this.commandHandler = commandHandler;
    this.toolHandler = toolHandler;
  }
}
