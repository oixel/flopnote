// Base class for all commands
export class Command {
  redo: VoidFunction;
  undo: VoidFunction;

  constructor(redo: VoidFunction, undo: VoidFunction) {
    this.redo = redo;
    this.undo = undo;
  }
}
