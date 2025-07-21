<script lang="ts">
    import Canvas from "$lib/components/Canvas.svelte";

//   Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

//   Reactive variables relating to the brush / eraser
  let isBrush = $state(true);
  let brushSize = $state(3);
  let eraserSize = $state(6);
  let brushColor = $state("#000000");

  function onkeydown(event: KeyboardEvent) {
    switch (event.key) {
      // Enables brush with 'b'
      case "b":
        isBrush = true;
        break;
      // Enables eraser with 'e'
      case "e":
        isBrush = false;
        break;
      // Increases current brush/eraser size with up arrow
      case "ArrowUp":
        if (isBrush) brushSize++;
        else eraserSize++;
        break;
      // Decreases current brush/eraser size with down arrow
      case "ArrowDown":
        if (isBrush && brushSize > 1) brushSize--;
        else if (eraserSize > 1) eraserSize--;
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
        {isBrush ? "Brush" : "Eraser"}<br /> <b>Size: </b>
        {brushSize}px
      </p>
    </div>
    <Canvas
      width={canvasWidth}
      height={canvasHeight}
      {isBrush}
      {brushColor}
      brushSize={isBrush ? brushSize : eraserSize}
    />
    <div
      class="grow w-full h-[{canvasHeight}px] flex flex-col justify-start items-start"
    >
      <div
        class="w-9/10 max-w-48 p-2 mx-auto md:mx-2 flex flex-col rounded-md border-2 bg-white"
      >
        <input
          type="color"
          bind:value={brushColor}
          class="w-full h-full rounded-xl aspect-square style cursor-pointer border-solid hover:scale-102 transition-all duration-100"
        />
        <input
          type="text"
          class="w-full text-center pt-1"
          bind:value={brushColor}
        />
      </div>
    </div>
  </div>
</div>
