import { Command } from "./Commands";

export class CommandHandler {
  pointer: number = 0;
  commands: Array<Command> = [];

  // Appends new command to the commands timeline
  addCommand(command: Command) {
    // If undo point is not at end of commands array, wipe all data after it
    if (this.pointer != this.commands.length)
      this.commands.splice(this.pointer);

    // Append newly called command to timeline
    this.commands.push(command);

    // Ensure that pointer always points to the end of the timeline when a new command is appended
    this.pointer = this.commands.length;
  }

  // Re-executes the current command and then moves to the next (if one exists)
  redo() {
    if (this.pointer < this.commands.length) {
      this.commands[this.pointer].redo();
      this.pointer += 1;
    }
  }

  // Calls undo function on the previous command (if one exists)
  undo() {
    if (this.pointer > 0) {
      this.pointer -= 1;
      this.commands[this.pointer].undo();
    }
  }
}
