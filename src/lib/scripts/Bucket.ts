//
class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

//
function hexToColor(hex: string, alpha: number): Color {
  //
  hex.replace("#", "");

  const red = parseInt(hex.substring(1, 3), 16);
  const green = parseInt(hex.substring(3, 5), 16);
  const blue = parseInt(hex.substring(5, 7), 16);

  return new Color(red, green, blue, alpha);
}

//
function getColor(imageData: ImageData, coord: number): Color {
  const data = imageData.data;

  return new Color(
    data[coord],
    data[coord + 1],
    data[coord + 2],
    data[coord + 3]
  );
}

//
function setColor(imageData: ImageData, coord: number, color: Color): void {
  const data = imageData.data;

  data[coord] = color.r;
  data[coord + 1] = color.g;
  data[coord + 2] = color.b;
  data[coord + 3] = color.a;
}

//
function compareColors(colorA: Color, colorB: Color): boolean {
  return (
    colorA.r === colorB.r &&
    colorA.g === colorB.g &&
    colorA.b === colorB.b &&
    colorA.a === colorB.a
  );
}

// A combined iterative / recursive flood fill algorithm based on https://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
export function bucketFill(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string
): void {
  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const pixelStack = [{ x, y }];
  const imageData = context.getImageData(0, 0, width, height);

  // Represents the pixel's coordinate in the linear array of image data
  // Note: each value follows the structure of [red, green, blue, alpha, red, ...]
  let coord = (y * width + x) * 4;

  const startColor = getColor(imageData, coord);
  const fillColor = hexToColor(color, 255);

  // Prevent filling a color if it already matches
  if (compareColors(startColor, fillColor)) return;

  //
  while (pixelStack.length > 0) {
    const newPixel = pixelStack.pop() as { x: number; y: number };

    x = newPixel.x;
    y = newPixel.y;

    coord = (y * width + x) * 4;

    //
    while (y-- >= 0 && compareColors(getColor(imageData, coord), startColor)) {
      coord -= width * 4;
    }

    //
    coord += width * 4;
    y++;

    //
    let reachedLeft = false;
    let reachedRight = false;

    // 
    while (
      y++ < height &&
      compareColors(getColor(imageData, coord), startColor)
    ) {
      setColor(imageData, coord, fillColor);

      if (x > 0) {
        if (compareColors(getColor(imageData, coord - 4), startColor)) {
          if (!reachedLeft) {
            pixelStack.push({ x: x - 1, y });
            reachedLeft = true;
          }
        } else if (reachedLeft) {
          reachedLeft = false;
        }
      }

      if (x < width - 1) {
        if (compareColors(getColor(imageData, coord + 4), startColor)) {
          if (!reachedRight) {
            pixelStack.push({ x: x + 1, y });
            reachedRight = true;
          }
        } else if (reachedRight) {
          reachedRight = false;
        }
      }

      coord += width * 4;
    }
  }

  //
  context.putImageData(imageData, 0, 0);
}
