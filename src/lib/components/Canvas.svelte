<script lang="ts">
  import { onMount } from "svelte";

  import { bucketFill } from "$lib/scripts/Bucket";

  let {
    width,
    height,
    isBrush,
    brushColor,
    brushSize,
  }: {
    width: number;
    height: number;
    isBrush: boolean;
    brushColor: string;
    brushSize: number;
  } = $props();

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  // Variables relating to active drawing
  let isDrawing = false;
  let offsetX: number;
  let offsetY: number;
  let prevMouseX: number;
  let prevMouseY: number;

  //   Allows for brush hovering while mouse is over canvas
  let isHovering = $state(false);
  let hoverPos = $state({ x: 0, y: 0 });

  let canvasPosition = { x: 0, y: 0 };

  interface Stroke {
    isBrush: boolean;
    brushSize: number;
    brushColor: string;
    x: number;
    y: number;
  }

  let undoPointer: number = 0; // Tracks how far back we have undone (gets set to end of array whenever a new stroke is added)
  let currentStroke: Array<Stroke> = [];
  let strokes: Array<Array<Stroke>> = [];

  onMount(() => {
    // Initialize 2D context of canvas to allow for drawing
    context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Initialize canvas with transparent background so that bucket can fill it
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fillRect(0, 0, width, height);

    // Initialize canvas' offset
    setOffset();
  });

  // Ensures that mouse pointer is correctly offset to within the Canvas element
  function setOffset() {
    const rect = canvas.getBoundingClientRect();
    offsetX = rect.x;
    offsetY = rect.y;
  }

  // Draw a line stroke from the previous mouse position to the current mouse position
  function draw(
    prevX: number,
    prevY: number,
    x: number,
    y: number,
    lineWidth: number,
    lineColor: string,
  ) {
    // Apply stroke's current brush attributes before drawing out the stroke
    context.lineWidth = lineWidth;
    context.strokeStyle = lineColor;

    // Ensure that the brush is round
    context.lineCap = "round";

    // Draw out the brush stroke!
    context.beginPath();
    context.moveTo(prevX, prevY);
    context.lineTo(x, y);
    context.stroke();
  }

  //   Called when eraser is used to draw; wipes the points under the eraser!
  function erase(x: number, y: number, lineWidth: number) {
    context.clearRect(x, y, lineWidth, lineWidth);
  }

  // Toggle drawing on and grab line stroke's starting position
  function startMouseDraw(event: MouseEvent) {
    // If undo point is not at end of strokes array, wipe all data after it
    strokes.splice(undoPointer);

    context.lineWidth = brushSize;

    // Enable drawing mode
    isDrawing = true;

    // Initialize brush stroke position to wherever the mouse has clicked
    prevMouseX = event.x - offsetX;
    prevMouseY = event.y - offsetY;

    // Add initial brush stroke to canvas
    draw(prevMouseX, prevMouseY, prevMouseX, prevMouseY, brushSize, brushColor);

    currentStroke.push({
      isBrush,
      brushSize,
      brushColor,
      x: prevMouseX,
      y: prevMouseY,
    });
  }

  // Handles drawing as mouse moves around canvas
  function mouseDraw(event: MouseEvent) {
    // Only draw line strokes if mouse is held down
    if (isDrawing) {
      // Grab current mouse position with consideration for offset
      const x = event.x - offsetX;
      const y = event.y - offsetY;

      // Draw out line from previous mouse position to current mouse position
      if (isBrush) draw(prevMouseX, prevMouseY, x, y, brushSize, brushColor);
      else erase(x, y, brushSize);

      // Update previous mouse position
      prevMouseX = x;
      prevMouseY = y;

      // Append the new points to the array of points form the current stroke
      currentStroke.push({ isBrush, brushSize, brushColor, x, y });
    }
  }

  // Toggle drawing off when mouse is released
  function endDraw(event: MouseEvent) {
    if (isDrawing) {
      isDrawing = false;

      // Add final points of brush stroke to canvas
      const x = event.x - offsetX;
      const y = event.y - offsetY;

      draw(prevMouseX, prevMouseY, x, y, brushSize, brushColor);

      currentStroke.push({
        isBrush,
        brushSize,
        brushColor,
        x,
        y,
      });

      // Append the current brush stroke to the array of all strokes
      strokes.push(currentStroke);

      // Move undo pointer to the end of strokes
      undoPointer = strokes.length;

      // Wipe the current stroke point data to reuse the array for the next stroke
      currentStroke = [];
    }
  }

  // Provides brush hovering support for wherever the mouse is located
  function handleMouseHover(event: MouseEvent) {
    // Apply an offset if brush is being used instead of eraser (due to how brush draws)
    let brushOffset = isBrush ? (brushSize / 2) * Number(isBrush) : 0;
    hoverPos = { x: event.x - brushOffset, y: event.y - brushOffset };
  }

  // Move undo pointer back one (if possible)
  function undo() {
    if (undoPointer) --undoPointer;
    render();
  }

  // Move undo pointer forward one (if possible)
  function redo() {
    if (undoPointer < strokes.length) ++undoPointer;
    render();
  }

  // Takes all currently drawn lines and places them onto the screen
  function render() {
    // Wipe all strokes on canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Render out every single brush stroke
    for (let i = 0; i < undoPointer; i++) {
      const stroke = strokes[i];

      // Grab initial brush stroke point
      let prevX = stroke[0].x;
      let prevY = stroke[0].y;

      // Initialize x and y to previous values so that the initial brush stroke is not lost
      let x = prevX;
      let y = prevY;

      // Render out every single point for the current stroke
      for (let j = 0; j < stroke.length; j++) {
        if (stroke[j].isBrush) {
          // Draw a line stroke from the previous mouse position to the current mouse position
          draw(prevX, prevY, x, y, stroke[j].brushSize, stroke[j].brushColor);
        } else {
          // Or erase at the current position if eraser is enabled
          erase(x, y, stroke[j].brushSize);
        }

        // Work is done with the current x and y, so we can store they can be stored as old values
        prevX = x;
        prevY = y;

        // Update x and y to be the next points of the current brush stroke
        x = stroke[j].x;
        y = stroke[j].y;
      }
    }
  }

  // Handles keyboard shortcut for the Canvas
  function onkeydown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case "z":
          // Allows for undo and redo with Ctrl+Z and Ctrl+Shift+Z
          if (!event.shiftKey) undo();
          else redo();

          break;
        case "y":
          // Allows for redo functionality with Ctrl+Y
          redo();

          break;
      }
    }

    if (event.key == "g")
      bucketFill(canvas, canvasPosition.x, canvasPosition.y, brushColor);
  }
</script>

<!-- Update offset whenever the window's size is changed -->
<!-- And Handle drawing as mouse is pressed and moved around the window -->
<svelte:window
  onresize={setOffset}
  {onkeydown}
  onmousedown={startMouseDraw}
  onmouseup={endDraw}
  onmousemove={mouseDraw}
/>

<!-- Track mouse position to place brush hover where mouse is -->
<svelte:document onmousemove={handleMouseHover} />

<!-- Renders brush/eraser wherever mouse is hovering on canvas-->
<div
  style={`
        left: ${hoverPos.x}px;
        top: ${hoverPos.y}px; 
        width: ${brushSize}px; 
        height: ${brushSize}px;
        background-color: ${isBrush ? brushColor : "#ffffff"};
        border-radius: ${isBrush ? "50%" : "0"};
    `}
  class="{isHovering ? 'visible' : 'hidden'} absolute {!isBrush
    ? 'border-1'
    : ''} select-none pointer-events-none"
></div>

<canvas
  {width}
  {height}
  bind:this={canvas}
  onmouseenter={() => {
    // Only allow brush hovering while cursor is in the bounds of the canvas
    isHovering = true;
  }}
  onmouseleave={() => {
    // Turn off brush hovering when mouse exits the canvas' bounds
    isHovering = false;
  }}
  onmousemove={(event: MouseEvent) => {
    // Update the mouse's position relative to the canvas
    canvasPosition = { x: event.offsetX, y: event.offsetY };
  }}
  class="bg-white rounded-md cursor-none select-none"
>
</canvas>
