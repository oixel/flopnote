<script lang="ts">
  import Canvas from "$lib/components/Canvas.svelte";

  let isBrush = $state(true);
  let brushSize = $state(3);
  let eraserSize = $state(6);

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
    <Canvas
      width={500}
      height={500}
      {isBrush}
      brushColor={"#000000"}
      brushSize={isBrush ? brushSize : eraserSize}
    />
  </div>
</div>
