<script lang="ts">
  import { onMount } from "svelte";

  import { ToolHandler } from "$lib/classes/handlers/ToolHandler.svelte";

  let {
    width,
    height,
    toolHandler,
    zIndex,
    selected,
    isBackground = false,
  }: {
    width: number;
    height: number;
    toolHandler: ToolHandler;
    zIndex: number;
    selected: boolean;
    isBackground?: boolean;
  } = $props();

  let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;

  // Grab the current tool from the ToolHandler to apply hover style and access custom values
  let tool = $derived(toolHandler.tool);

  // Variables relating to active tool usage
  let isMouseDown = false;
  let offsetX: number;
  let offsetY: number;

  // Allows for tool hovering while mouse is over canvas
  let isHovering = $state(false);
  let hoverPos = $state({ x: 0, y: 0 });

  onMount(() => {
    setOffset();
  });

  // Ensures that mouse pointer is correctly offset to within the Canvas element
  function setOffset() {
    const rect = canvas.getBoundingClientRect();

    offsetX = rect.x;
    offsetY = rect.y;
  }

  // Toggle mouseDown on and call tool's start functionality
  function startUse(event: MouseEvent) {
    // Update the mouseDown status
    isMouseDown = true;

    // Call tool's start functionality on initial mouse click
    toolHandler.startUse(canvas, event.x - offsetX, event.y - offsetY);
  }

  // Handles tool usage as mouse moves around canvas
  function use(event: MouseEvent) {
    // Only use tool if mouse is actively held down
    if (isMouseDown) {
      // Grab current mouse position with consideration for offset
      const x = event.x - offsetX;
      const y = event.y - offsetY;

      toolHandler.dragUse(canvas, x, y);
    }
  }

  // Toggle mouseDown off when mouse is released and call tool's end functionality
  function endUse(event: MouseEvent) {
    if (isMouseDown) {
      isMouseDown = false;

      // Call tool's end functionality when mouse is released
      toolHandler.endUse(canvas, event.x - offsetX, event.y - offsetY);
    }
  }
</script>

<!-- Update offset whenever the window's size is changed -->
<!-- And handle tool usage as mouse is pressed/released and moved around the window -->
<svelte:window
  onresize={setOffset}
  {onkeydown}
  onmouseup={endUse}
  onmousemove={use}
/>

<!-- Track mouse position to place tool hover where mouse is -->
<svelte:document
  onmousemove={(event: MouseEvent) => {
    hoverPos = { x: event.x, y: event.y };
  }}
/>

{#if tool}
  <!-- Renders tool wherever mouse is hovering on this layer-->
  {#if selected}
    <div
      style={`
        left: ${hoverPos.x}px;
        top: ${hoverPos.y}px; 
        ${tool.size ? `width: ${tool.size}px; height: ${tool.size}px;` : ""}
        background-color: ${tool.color ? toolHandler.color : ""};
        opacity: ${tool.opacity ? `${(tool.opacity * 100) / 255}%` : "100%"};
        z-index: ${zIndex + 1};
    `}
      class="{isHovering
        ? 'visible'
        : 'hidden'} {tool.hoverStyle} fixed pointer-events-none"
    ></div>
  {/if}

  <canvas
    {width}
    {height}
    bind:this={canvas}
    onmousedown={startUse}
    onmouseenter={() => {
      // Only allow tool hovering while cursor is in the bounds of the canvas
      isHovering = true;
    }}
    onmouseleave={() => {
      // Turn off tool hovering when mouse exits the canvas' bounds
      isHovering = false;
    }}
    class="absolute inset-0 rounded-md border-2 {tool?.cursor}  {selected
      ? ''
      : 'pointer-events-none'}"
    style="{isBackground
      ? `background-color: ${toolHandler.backgroundColor};`
      : ''}
      z-index: {zIndex};
      "
  >
  </canvas>
{/if}
