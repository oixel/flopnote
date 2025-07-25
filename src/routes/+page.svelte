<script lang="ts">
  import Canvas from "$lib/components/Canvas.svelte";
  import { BrushHandler } from "$lib/classes/handlers/BrushHandler.svelte";
  import BrushSettings from "$lib/components/BrushSettings.svelte";
  import { CommandHandler } from "$lib/classes/handlers/CommandHandler";
  import { InputHandler } from "$lib/classes/handlers/InputHandler.svelte";
  import ColorPicker from "$lib/components/ColorPicker.svelte";
  import RecentColors from "$lib/components/RecentColors.svelte";

  // Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

  // Instantiate a CommandHandler to allow for undo/redo
  const commandHandler = new CommandHandler();

  const brushHandler = new BrushHandler(commandHandler); // Manages the current brush and data across all brushes
  let brush = $derived(brushHandler.brush); // Grab the current brush from the brush handler to avoid having to do brushHandler.brush every time I desire to access it

  // Instantiate an InputHandler to allow for keyboard shortcuts
  const inputHandler = new InputHandler(commandHandler, brushHandler);
</script>

<svelte:window
  onkeydown={(event) => inputHandler.onkeydown(event)}
  onkeyup={(event) => inputHandler.onkeyup(event)}
  onwheel={(event) => inputHandler.onwheel(event)}
/>

{#if brush}
  <div
    class="fixed w-full h-full flex flex-col overflow-hidden overscroll-none touch-none select-none cursor-default"
  >
    <h1
      class="text-2xl font-medium bg-blue-900 text-white min-w-120 text-center py-3"
    >
      Welcome to flopnote!
    </h1>
    <div class="flex justify-center items-center bg-blue-200 h-full grow">
      <!-- Tools to the left of the canvas -->
      <div
        class="grow w-full flex flex-col h-full justify-center items-end gap-2"
      ></div>

      <!-- The canvas which the user draws on -->
      <Canvas width={canvasWidth} height={canvasHeight} {brushHandler} />

      <!-- Tools to the right side of the canvas -->
      <div
        class="grow w-full mx-auto md:mx-2 flex flex-col h-full justify-center items-start gap-2"
      >
        {#if brush.color || brush.name == "Eye Dropper"}
          <ColorPicker bind:color={brushHandler.color} />
          <RecentColors {brushHandler} />
        {/if}
        <BrushSettings bind:brush />
      </div>
    </div>
  </div>
{/if}
