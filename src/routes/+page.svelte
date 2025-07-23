<script lang="ts">
  import Canvas from "$lib/components/Canvas.svelte";
  import { Brush, PaintBrush } from "$lib/scripts/Brushes.svelte";

  // Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

  //
  const paintBrush = new PaintBrush("#000000", 3);

  // Reactive variable storing the currently selected brush / tool
  let brush : Brush = $state(paintBrush);

  function onkeydown(event: KeyboardEvent) {
    switch (event.key) {
      // Enables brush with 'b'
      case "b":
        break;
      // Enables eraser with 'e'
      case "e":
        break;
      // Increases current brush/eraser size with up arrow
      case "ArrowUp":
        brush.changeSize(1);
        break;
      // Decreases current brush/eraser size with down arrow
      case "ArrowDown":
        brush.changeSize(-1);
        break;
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="flex flex-col h-[100vh] overflow-hidden">
  <h1
    class="text-2xl font-medium bg-blue-900 text-white min-w-120 text-center py-3 select-none"
  >
    Welcome to flopnote!
  </h1>
  <div class="flex justify-center items-center bg-blue-200 h-full grow">
    <div class="grow w-full flex flex-col items-end">
      <!-- Displays currently selected tool and its size -->
      <p class="select-none text-center pr-4">
        <b>Tool:</b>
        {brush.name ? "Brush" : "Eraser"}<br /> <b>Size: </b>
        {brush.size}px
      </p>
      <input type="range" min="1" max="50" bind:value={brush.size} />
    </div>
    <Canvas width={canvasWidth} height={canvasHeight} {brush} />
    <div
      class="grow w-full h-[{canvasHeight}px] flex flex-col justify-start items-start"
    >
      <div
        class="w-9/10 max-w-48 p-2 mx-auto md:mx-2 flex flex-col rounded-md border-2 bg-white"
      >
        <input
          type="color"
          bind:value={brush.color}
          class="w-full h-full rounded-xl aspect-square style cursor-pointer border-solid hover:scale-102 transition-all duration-100"
        />
        <input
          type="text"
          class="w-full text-center pt-1"
          bind:value={brush.color}
        />
      </div>
    </div>
  </div>
</div>
