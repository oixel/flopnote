export class Command {
  run: VoidFunction;
  undo: VoidFunction;

  constructor(run: VoidFunction, undo: VoidFunction) {
    this.run = run;
    this.undo = undo;
  }
}

export class CommandHandler {
  undoPointer: number = 0;
  commands: Array<Command> = [];

  addCommand(command: Command) {
    // If undo point is not at end of commands array, wipe all data after it
    this.commands.splice(this.undoPointer);

    this.commands.push(command);
    this.undoPointer = this.commands.length;

    command.run();
  }

  run() {
    if (this.undoPointer < this.commands.length) {
      this.commands[this.undoPointer].run();
      this.undoPointer++;
    }
  }

  undo() {
    if (this.undoPointer > 0) {
      this.commands[this.undoPointer].run();
      this.undoPointer--;
    }
  }
}
