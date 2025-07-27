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
): void {
  // Store canvas data in variables for cleaner code
  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const pixelStack = [{ x, y }];
  const imageData = context.getImageData(0, 0, width, height);

  // Fixed 8-bit unsigned integer, 0 by default (essentially a array of all coords defaulted to false)
  const visited = new Uint8Array(width * height);

  // Takes cartesian coordinate and converts it to linear coordinate for position in the visited array / canvas ImageData
  const getIndex = (x: number, y: number): number => y * width + x;
  const getPixelCoord = (x: number, y: number): number => getIndex(x, y) * 4;

  // Represents the pixel's coordinate (x, y) as a *linear* coordinate in the *linear* array of image data
  // Note: each value follows the structure of [red, green, blue, alpha, red, ...]
  let coord = getPixelCoord(x, y);

  const startColor: Color = getColor(imageData, coord);

  // Loops through all pixels that match the color of the start pixel
  while (pixelStack.length > 0) {
    // Move to the next pixel in stack
    const newPixel = pixelStack.pop() as { x: number; y: number };

    x = newPixel.x;
    y = newPixel.y;
    coord = getPixelCoord(x, y); // Pixel's coordinates are linear since ImageData is a 1D array where each pixel is represented by 4 indexes for RGBA

    // Move to topmost pixel that matches the starting color
    while (
      y-- >= 0 &&
      doColorsMatch(getColor(imageData, coord), startColor, threshold)
    ) {
      coord -= width * 4;
    }

    y++;
    coord += width * 4;

    // Prevent looping past furthest left / right point
    let reachedLeft = false;
    let reachedRight = false;

    // Move downwards as long as the pixel's color is the same as the starting color (in relation to threshold)
    while (
      y++ < height &&
      doColorsMatch(getColor(imageData, coord), startColor, threshold)
    ) {
      // Fill the current pixel with the fill color, but keep the stroke's opacity
      const fillColor = hexToColor(color, getColor(imageData, coord).a);
      setColor(imageData, coord, fillColor);
      visited[getIndex(x, y)] = 1;

      // Check left neighboring pixel
      if (x > 0) {
        if (
          doColorsMatch(getColor(imageData, coord - 4), startColor, threshold)
        ) {
          if (!reachedLeft && !visited[getIndex(x - 1, y)]) {
            pixelStack.push({ x: x - 1, y: y });
            visited[getIndex(x - 1, y)] = 1;
            reachedLeft = true;
          }
        } else if (reachedLeft) {
          reachedLeft = false;
        }
      }

      // Check right neighboring pixel
      if (x < width - 1) {
        if (
          doColorsMatch(getColor(imageData, coord + 4), startColor, threshold)
        ) {
          if (!reachedRight && !visited[getIndex(x + 1, y)]) {
            pixelStack.push({ x: x + 1, y: y });
            visited[getIndex(x + 1, y)] = 1;
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

// Bucket Tool
export class Bucket extends Tool {
  success: boolean = false;
  threshold: number = $state(0);

  // Flood fill all pixels with matching color (in relation to threshold) and store command
  startUse(canvas: HTMLCanvasElement, x: number, y: number): void {
    this.storePreviousImageData(canvas);
    bucketFill(canvas, x, y, this.color as string, this.threshold);
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
