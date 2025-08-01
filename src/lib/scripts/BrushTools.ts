export function interpolate(
  brushStroke: Array<{ x: number; y: number }>,
  size: number
): Array<{ x: number; y: number }> {
  const interpolatedPoints: Array<{ x: number; y: number }> = [];

  for (let i = 1; i < brushStroke.length; i++) {
    // Grab previous and current positions from brush stroke points
    const x0 = brushStroke[i - 1].x;
    const y0 = brushStroke[i - 1].y;
    const x1 = brushStroke[i].x;
    const y1 = brushStroke[i].y;

    // Use the distance formula to determine the distance between the previous brush stroke point and the current
    const distance = Math.hypot(x1 - x0, y1 - y0);

    // Determine how many points are needed based on the brush's current size.
    const steps = Math.ceil(distance / (size / 2));

    // Move through all points from previous brush stroke point to current and store all interpolated points
    for (let i = 0; i <= steps; i++) {
      const interpolation = i / steps;
      const x = x0 + (x1 - x0) * interpolation;
      const y = y0 + (y1 - y0) * interpolation;

      interpolatedPoints.push({ x, y });
    }
  }

  return interpolatedPoints;
}
