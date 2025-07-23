<script lang="ts">
  import Canvas from "$lib/components/Canvas.svelte";
  import { BrushHandler } from "$lib/scripts/BrushHandler.svelte";
  import { CommandHandler } from "$lib/scripts/CommandHandler";
  import { InputHandler } from "$lib/scripts/InputHandler.svelte";

  // Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

  // Instantiate a CommandHandler to allow for undo/redo
  const commandHandler = new CommandHandler();
  const brushHandler = new BrushHandler(commandHandler);
  const inputHandler = new InputHandler(commandHandler, brushHandler);

  //
  let brush = $derived(brushHandler.brush);
</script>

<svelte:window
  onkeydown={(event) => inputHandler.onkeydown(event)}
  onkeyup={(event) => inputHandler.onkeyup(event)}
  onwheel={(event) => inputHandler.onwheel(event)}
/>

{#if brush}
  <div
    class="flex flex-col h-[100vh] overflow-hidden select-none cursor-default"
  >
    <h1
      class="text-2xl font-medium bg-blue-900 text-white min-w-120 text-center py-3"
    >
      Welcome to flopnote!
    </h1>
    <div class="flex justify-center items-center bg-blue-200 h-full grow">
      <!-- Tools to the left of the canvas -->
      <div class="grow w-full flex flex-col items-end">
        <div
          class="min-w-38 max-w-38 p-2 mx-auto md:mx-2 flex flex-col justify-center items-center bg-blue-900 text-white rounded-md border-2 border-white text-center"
        >
          <!-- Displays currently selected tool -->
          <p class="">
            <b>Tool:</b>
            {brush?.name}
          </p>

          <!-- Displays currently selected tool's size (if it uses one) -->
          {#if brush && brush.usesSize}
            <p>
              <b>Size:</b>
              {brush.size}
            </p>

            <input
              type="range"
              min="1"
              max="50"
              bind:value={brush.size}
              class="cursor-pointer"
            />
          {/if}
        </div>
      </div>

      <!-- The canvas which the user draws on -->
      <Canvas width={canvasWidth} height={canvasHeight} {brush} />

      <!-- Tools to the right side of the canvas -->
      <div
        class="grow w-full h-[{canvasHeight}px] flex flex-col justify-start items-start"
      >
        {#if brush && brush.usesColor}
          <!-- Color Picker -->
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
        {/if}
      </div>
    </div>
  </div>
{/if}
