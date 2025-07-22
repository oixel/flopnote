<script lang="ts">
  import { onMount } from "svelte";

  import { Command, CommandHandler } from "$lib/scripts/CommandHandler";
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

  let allImageData: Array<ImageData> = [];
  let imageDataPointer = 0;

  function updateImageData() {
    const prevImageData: ImageData = context.getImageData(0, 0, width, height);
    allImageData.push(prevImageData);
    imageDataPointer = allImageData.length - 1;
    console.log(imageDataPointer)
  }

  onMount(() => {
    // Initialize 2D context of canvas to allow for drawing
    context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Initialize canvas with transparent background so that bucket can fill it
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fillRect(0, 0, width, height);

    // Initialize canvas' offset
    setOffset();

    //
    updateImageData();
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
    lineColor: string
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
   if (imageDataPointer != allImageData.length - 1) allImageData.splice(imageDataPointer + 1);

    context.lineWidth = brushSize;

    // Enable drawing mode
    isDrawing = true;

    // Initialize brush stroke position to wherever the mouse has clicked
    prevMouseX = event.x - offsetX;
    prevMouseY = event.y - offsetY;

    // Add initial brush stroke to canvas by cheesing the canvas `lineTo()` function (allows for dots)
    draw(
      prevMouseX,
      prevMouseY,
      prevMouseX + 0.001,
      prevMouseY + 0.001,
      brushSize,
      brushColor
    );
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

      updateImageData();

      // function run() {
      //   context.putImageData(context.getImageData(0, 0, width, height), 0, 0);
      // }
      // const drawCommand = new Command(run undo)
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
    if (imageDataPointer > 0) imageDataPointer -= 1;
    console.log(imageDataPointer);
    render();
  }

  // Move undo pointer forward one (if possible)
  function redo() {
    if (imageDataPointer < allImageData.length - 1) imageDataPointer += 1;
    console.log(imageDataPointer);
    render();
  }

  // Takes all currently drawn lines and places them onto the screen
  function render() {
    context.putImageData(allImageData[imageDataPointer], 0, 0);
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
