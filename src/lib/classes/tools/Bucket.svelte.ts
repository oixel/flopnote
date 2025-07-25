import { Tool } from "$lib/classes/Tool.svelte";
import type { Color } from "$lib/classes/Color";

import {
  hexToColor,
  getColor,
  setColor,
  doColorsMatch,
} from "$lib/scripts/ColorTools";

import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";

// A combined iterative / recursive flood fill algorithm based on https://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
function bucketFill(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  threshold: number
): boolean {
  // Store canvas data in variables for cleaner code
  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const pixelStack = [{ x, y }];
  const imageData = context.getImageData(0, 0, width, height);

  // Represents the pixel's coordinate (x, y) as a *linear* coordinate in the *linear* array of image data
  // Note: each value follows the structure of [red, green, blue, alpha, red, ...]
  let coord = (y * width + x) * 4;

  const startColor: Color = getColor(imageData, coord);
  const fillColor: Color = hexToColor(color, 255);

  // Prevent fill if clicked color is IDENTICAL to starting color
  if (doColorsMatch(startColor, fillColor, 0)) return false;

  // Loops through all pixels that match the color of the start pixel
  while (pixelStack.length > 0) {
    // Move to the next pixel in stack
    const newPixel = pixelStack.pop() as { x: number; y: number };

    x = newPixel.x;
    y = newPixel.y;

    // Convert new pixel's regular coordinate position, to a *linear* coordinate
    coord = (y * width + x) * 4;

    // Move to furthest upwards point that matches the starting color
    while (
      y-- >= 0 &&
      doColorsMatch(getColor(imageData, coord), startColor, threshold)
    ) {
      coord -= width * 4;
    }

    coord += width * 4;
    y++;

    // Prevent looping past furthest left / right point
    let reachedLeft = false;
    let reachedRight = false;

    // Move downwards as long as the pixel's color is the same as the starting color (in relation to threshold)
    while (
      y++ < height &&
      doColorsMatch(getColor(imageData, coord), startColor, threshold)
    ) {
      // Fill the current pixel with the fill color!
      setColor(imageData, coord, fillColor);

      // Move as far left as possible before a different colored pixel is reached
      if (x > 0) {
        if (
          doColorsMatch(getColor(imageData, coord - 4), startColor, threshold)
        ) {
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
        if (
          doColorsMatch(getColor(imageData, coord + 4), startColor, threshold)
        ) {
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

  // Bucket fill was a success, store the command in command history
  return true;
}

// Bucket Tool
export class Bucket extends Tool {
  success: boolean = false;
  threshold: number = $state(0);

  // Attempt to flood fill all pixels with matching color (in relation to threshold), and store command on success
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.storePreviousImageData(canvas);
    if (bucketFill(canvas, x, y, this.color as string, this.threshold))
      this.storeCommand(canvas);
  }

  constructor(
    commandHandler: CommandHandler,
    color: string,
    threshold: number
  ) {
    super("Bucket", commandHandler);
    this.color = color;
    this.threshold = threshold;
    this.hoverStyle = "w-5 h-5";
  }
}
