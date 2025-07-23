export class Brush {
  name: string;
  color: string = $state("");
  size: number = $state(0);
  hoverStyle: string;

  //
  changeSize(change: number) {
    this.size += change;
    if (this.size <= 0) this.size = 1;
  }

  //
  draw(context: CanvasRenderingContext2D, x: number, y: number): void {
    console.log("Drawing on", context, "at", x, y);
  }

  //
  stopDraw(): void {
    return;
  }

  constructor(
    name: string,
    color: string,
    size: number,
    hoverStyle: string = ""
  ) {
    this.name = name;
    this.color = color;
    this.size = size;
    this.hoverStyle = hoverStyle;
  }
}

export class PaintBrush extends Brush {
  prevX: number | null;
  prevY: number | null;

  // Draw a line stroke from the previous mouse position to the current mouse position
  draw(context: CanvasRenderingContext2D, x: number, y: number): void {
    //
    if (!this.prevX) this.prevX = x + 0.0001;
    if (!this.prevY) this.prevY = y + 0.0001;

    // Apply stroke's current brush attributes before drawing out the stroke
    context.lineWidth = this.size;
    context.strokeStyle = this.color;

    // Ensure that the brush is round
    context.lineCap = "round";

    // Draw out the brush stroke!
    context.beginPath();
    context.moveTo(this.prevX, this.prevY);
    context.lineTo(x, y);
    context.stroke();

    this.prevX = x;
    this.prevY = y;
  }

  //
  stopDraw() {
    this.prevX = null;
    this.prevY = null;
  }

  constructor(color: string, size: number) {
    super("Paint Brush", color, size, "rounded-full");

    this.prevX = null;
    this.prevY = null;
  }
}
