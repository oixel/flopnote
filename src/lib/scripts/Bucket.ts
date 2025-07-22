import {
  Color,
  hexToColor,
  getColor,
  setColor,
  compareColors,
} from "$lib/scripts/ColorTools";

// A combined iterative / recursive flood fill algorithm based on https://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
export function bucketFill(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string
): void {
  const width: number = canvas.width;
  const height: number = canvas.height;
  const context: CanvasRenderingContext2D = canvas.getContext(
    "2d"
  ) as CanvasRenderingContext2D;

  const pixelStack: Array<{ x: number; y: number }> = [{ x, y }];
  const imageData = context.getImageData(0, 0, width, height);

  // Represents the pixel's coordinate (x, y) as a *linear* coordinate in the *linear* array of image data
  // Note: each value follows the structure of [red, green, blue, alpha, red, ...]
  let coord: number = (y * width + x) * 4;

  const startColor: Color = getColor(imageData, coord);
  const fillColor: Color = hexToColor(color, 255);

  // Prevent filling a color if it already matches
  if (compareColors(startColor, fillColor)) return;

  // Loops through all pixels that match the color of the start pixel
  while (pixelStack.length > 0) {
    // Move to the next pixel in stack
    const newPixel: { x: number; y: number } = pixelStack.pop() as {
      x: number;
      y: number;
    };

    x = newPixel.x;
    y = newPixel.y;

    // Convert new pixel's regular coordinate position, to a *linear* coordinate
    coord = (y * width + x) * 4;

    // Move to furthest upwards point that matches the starting color
    while (y-- >= 0 && compareColors(getColor(imageData, coord), startColor)) {
      coord -= width * 4;
    }

    coord += width * 4;
    y += 1;

    // Prevent looping past furthest left / right point
    let reachedLeft: boolean = false;
    let reachedRight: boolean = false;

    // Move downwards as long as the pixel's color is the same as the starting color
    while (
      y++ < height &&
      compareColors(getColor(imageData, coord), startColor)
    ) {
      // Fill the current pixel with the fill color!
      setColor(imageData, coord, fillColor);

      // Move as far left as possible before a different colored pixel is reached
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

      // Move as far right as possible before a different colored pixel is reached
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

      // Move down one pixel!
      coord += width * 4;
    }
  }

  // Take the newly filled image data and push it to the canvas!
  context.putImageData(imageData, 0, 0);
}
