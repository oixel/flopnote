import { Color } from "$lib/classes/Color";

// Takes cartesian coordinate and converts it to linear coordinate for position in the visited array / canvas ImageData
export function getIndex(width: number, x: number, y: number): number {
  return Math.floor(y) * width + Math.floor(x);
}

export function getPixelCoord(width: number, x: number, y: number): number {
  return getIndex(width, x, y) * 4;
}

// Converts a hex string (used by color input) and alpha value into a Color object
export function hexToColor(hex: string, alpha: number): Color {
  // Remove hashtag if it is present in hex string
  hex.replace("#", "");

  //   Grab color data from string and convert it to a value from 0-255
  const red = parseInt(hex.substring(1, 3), 16);
  const green = parseInt(hex.substring(3, 5), 16);
  const blue = parseInt(hex.substring(5, 7), 16);

  //   Combine spliced values into a Color object
  return new Color(red, green, blue, alpha);
}

// Convert a Color instance into a hex string
export function colorToHex(color: Color): string {
  // Convert RGB values to hexadecimal
  let red = color.r.toString(16);
  let green = color.g.toString(16);
  let blue = color.b.toString(16);

  // Pad RGB values with leading zero if it is missing one
  if (red.length === 1) red = "0" + red;
  if (green.length === 1) green = "0" + green;
  if (blue.length === 1) blue = "0" + blue;

  return `#${red}${green}${blue}`;
}

// Returns a Color object of the pixel at the given linear coordinate
export function getColor(imageData: ImageData, coord: number): Color {
  const data = imageData.data;

  return new Color(
    data[coord],
    data[coord + 1],
    data[coord + 2],
    data[coord + 3]
  );
}

// Returns a Color object of the pixel at the given cartesian coordinate
export function getColorXY(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): Color {
  const context = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  const imageData = context.getImageData(x, y, 1, 1).data;

  return new Color(imageData[0], imageData[1], imageData[2], imageData[3]);
}

// Return a hex string representing the color of the pixel at the given linear coordinate
export function getColorHex(imageData: ImageData, coord: number): string {
  return colorToHex(getColor(imageData, coord));
}

// Return a hex string representing the color of the pixel at the given cartesian coordinate
export function getColorHexXY(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): string {
  return colorToHex(getColorXY(canvas, x, y));
}

// Returns the complementary color of the passed-in color
export function getComplementary(color: Color | string): Color | string {
  if (color instanceof Color)
    return new Color(255 - color.r, 255 - color.g, 255 - color.b, color.a);
  else {
    const converted = hexToColor(color, 255);
    const newColor = new Color(255 - converted.r, 255 - converted.g, 255 - converted.b, 255);
    return colorToHex(newColor);
  }
}

// Update color of pixel at linear coordinate to passed-in color (used in Bucket to update each relevant pixel's color)
export function setColor(
  imageData: ImageData,
  coord: number,
  color: Color
): void {
  const data = imageData.data;

  data[coord] = color.r;
  data[coord + 1] = color.g;
  data[coord + 2] = color.b;
  data[coord + 3] = color.a;
}

// Returns whether two colors are the same in relation to a threshold
export function doColorsMatch(
  colorA: Color,
  colorB: Color,
  threshold: number
): boolean {
  // Allows for semi-similar colors to be filled
  function inThreshold(numA: number, numB: number, threshold: number): boolean {
    return Math.abs(numA - numB) <= threshold;
  }

  return (
    inThreshold(colorA.r, colorB.r, threshold) &&
    inThreshold(colorA.g, colorB.g, threshold) &&
    inThreshold(colorA.b, colorB.b, threshold) &&
    inThreshold(colorA.a, colorB.a, threshold * 2)
  );
}
