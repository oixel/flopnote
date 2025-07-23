<script lang="ts">
  import { onMount } from "svelte";

  import { CommandHandler } from "$lib/scripts/CommandHandler";
  import { RenderCommand } from "$lib/scripts/Commands";
  import { bucketFill } from "$lib/scripts/Bucket";
  import type { Brush } from "$lib/scripts/Brushes";

  let {
    width,
    height,
    brush
  }: {
    width: number;
    height: number;
    brush: Brush;
  } = $props();

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  const commandHandler = new CommandHandler();

  // Variables relating to active drawing
  let isDrawing = false;
  let offsetX: number;
  let offsetY: number;

  //   Allows for brush hovering while mouse is over canvas
  let isHovering = $state(false);
  let hoverPos = $state({ x: 0, y: 0 });

  let canvasPosition = { x: 0, y: 0 };

  // Tracks the image data of the canvas before a new brush stroke occurs (used for undoing RenderCommand)
  let previousImageData: ImageData;

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

  //   Called when eraser is used to draw; wipes the points under the eraser!
  function erase(x: number, y: number, lineWidth: number) {
    context.clearRect(x, y, lineWidth, lineWidth);
  }

  // Toggle drawing on and grab line stroke's starting position
  function startMouseDraw(event: MouseEvent) {
    // 
    previousImageData = context.getImageData(0, 0, width, height);

    // Enable drawing mode
    isDrawing = true;

    // Add initial brush stroke to canvas by cheesing the canvas `lineTo()` function (allows for dots)
    brush.draw(context, event.x - offsetX, event.y - offsetY);
  }

  // Handles drawing as mouse moves around canvas
  function mouseDraw(event: MouseEvent) {
    // Only draw line strokes if mouse is held down
    if (isDrawing) {
      // Grab current mouse position with consideration for offset
      const x = event.x - offsetX;
      const y = event.y - offsetY;

      brush.draw(context, x, y);
    }
  }

  // Toggle drawing off when mouse is released
  function endDraw(event: MouseEvent) {
    if (isDrawing) {
      isDrawing = false;

      // Add final points of brush stroke to canvas
      const x = event.x - offsetX;
      const y = event.y - offsetY;

      brush.draw(context, x, y);
      brush.stopDraw();

      // Append new brush strokes to command timeline
      const command = new RenderCommand(canvas, previousImageData);
      commandHandler.addCommand(command);
    }
  }

  // Provides brush hovering support for wherever the mouse is located
  function handleMouseHover(event: MouseEvent) {
    // Apply an offset if brush is being used instead of eraser (due to how brush draws)
    let brushOffset = brush.name == "Paint Brush" ? (brush.size / 2) * Number(brush.name == "Paint Brush") : 0;
    hoverPos = { x: event.x - brushOffset, y: event.y - brushOffset };
  }

  // Handles keyboard shortcut for the Canvas
  function onkeydown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case "z":
          // Allows for undo and redo with Ctrl+Z and Ctrl+Shift+Z
          if (!event.shiftKey) commandHandler.undo();
          else commandHandler.redo();

          break;
        case "y":
          // Allows for redo functionality with Ctrl+Y
          commandHandler.redo();

          break;
      }
    }

    if (event.key == "g")
      bucketFill(canvas, canvasPosition.x, canvasPosition.y, brush.color);
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
        width: ${brush.size}px; 
        height: ${brush.size}px;
        background-color: ${brush.color};
    `}
  class="{isHovering ? "visible" : "hidden"} {brush.hoverStyle} absolute select-none pointer-events-none"
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
