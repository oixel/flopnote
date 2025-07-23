<script lang="ts">
  import { onMount } from "svelte";

  import { BrushHandler } from "$lib/scripts/BrushHandler.svelte";

  let {
    width,
    height,
    brushHandler,
  }: {
    width: number;
    height: number;
    brushHandler: BrushHandler;
  } = $props();

  let canvas: HTMLCanvasElement;

  // Grab the current brush from the brush handler to apply hover style and access custom values
  let brush = $derived(brushHandler.brush);

  // Variables relating to active drawing
  let isDrawing = false;
  let offsetX: number;
  let offsetY: number;

  // Allows for brush hovering while mouse is over canvas
  let isHovering = $state(false);
  let hoverPos = $state({ x: 0, y: 0 });

  let canvasPosition = { x: 0, y: 0 };

  onMount(() => {
    setOffset();
  });

  // Ensures that mouse pointer is correctly offset to within the Canvas element
  function setOffset() {
    const rect = canvas.getBoundingClientRect();

    offsetX = rect.x;
    offsetY = rect.y;
  }

  // Toggle drawing on and grab line stroke's starting position
  function startMouseDraw(event: MouseEvent) {
    // Enable drawing mode
    isDrawing = true;

    // Add initial brush stroke to canvas
    brushHandler.startDraw(canvas, event.x - offsetX, event.y - offsetY);
  }

  // Handles drawing as mouse moves around canvas
  function mouseDraw(event: MouseEvent) {
    // Only draw line strokes if mouse is held down
    if (isDrawing) {
      // Grab current mouse position with consideration for offset
      const x = event.x - offsetX;
      const y = event.y - offsetY;

      brushHandler.draw(canvas, x, y);
    }
  }

  // Toggle drawing off when mouse is released
  function endDraw(event: MouseEvent) {
    if (isDrawing) {
      isDrawing = false;

      // Add final points of brush stroke to canvas
      brushHandler.endDraw(canvas, event.x - offsetX, event.y - offsetY);
    }
  }

  // Provides brush hovering support for wherever the mouse is located
  function handleMouseHover(event: MouseEvent) {
    // Apply an offset if brush is being used instead of eraser (due to how brush draws)
    let brushOffset =
      brush?.name == "Paint Brush" && brush.size
        ? (brush?.size / 2) * Number(brush?.name == "Paint Brush")
        : 0;
    hoverPos = { x: event.x - brushOffset, y: event.y - brushOffset };
  }
</script>

<!-- Update offset whenever the window's size is changed -->
<!-- And Handle drawing as mouse is pressed and moved around the window -->
<svelte:window
  onresize={setOffset}
  {onkeydown}
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
        width: ${brush?.size}px; 
        height: ${brush?.size}px;
        background-color: ${brush?.color ? brushHandler.color : ""};
    `}
  class="{isHovering
    ? 'visible'
    : 'hidden'} {brush?.hoverStyle} fixed pointer-events-none"
></div>

<canvas
  {width}
  {height}
  bind:this={canvas}
  onmousedown={startMouseDraw}
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
  class="rounded-md border-2 {brush?.cursor}"
  style="background-color: {brushHandler.backgroundColor};"
>
</canvas>
