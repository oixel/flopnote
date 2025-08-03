<script lang="ts">
  import LayerHandler from "$lib/classes/handlers/LayerHandler.svelte";
  import Layer from "$lib/components/Layer.svelte";
  import LayerPreview from "$lib/components/LayerPreview.svelte";
  import { ToolHandler } from "$lib/classes/handlers/ToolHandler.svelte";
  import ToolSettings from "$lib/components/ToolSettings.svelte";
  import { CommandHandler } from "$lib/classes/handlers/CommandHandler";
  import { InputHandler } from "$lib/classes/handlers/InputHandler.svelte";
  import ColorPicker from "$lib/components/ColorPicker.svelte";
  import RecentColors from "$lib/components/RecentColors.svelte";

  // Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

  // Instantiate a CommandHandler to allow for undo/redo
  const commandHandler = new CommandHandler();

  const toolHandler = new ToolHandler(commandHandler); // Manages the current tool and data across all tools
  let tool = $derived(toolHandler.tool); // Grab the current tool from the tool handler to avoid having to do toolHandler.tool every time I desire to access it

  // Instantiate an InputHandler to allow for keyboard shortcuts
  const inputHandler = new InputHandler(commandHandler, toolHandler);

  //
  const layerHandler = new LayerHandler(canvasWidth, canvasHeight);
</script>

<svelte:window
  onkeydown={(event) => inputHandler.onkeydown(event)}
  onkeyup={(event) => inputHandler.onkeyup(event)}
  onwheel={(event) => inputHandler.onwheel(event)}
/>

{#if tool}
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
        class="grow w-full mx-3 flex flex-col h-full justify-center items-end gap-2"
      >
        <h2 class="mr-2 font-bold">[ Layers ]</h2>
        <!-- Layer Controls -->
        <div
          style="width: {canvasWidth / 8 + 4}px;"
          class="flex flex-col-reverse max-h-120 overflow-auto gap-1 mr-2.25"
        >
          {#each layerHandler.layers as _, index}
            <LayerPreview
              width={canvasWidth}
              height={canvasHeight}
              layers={layerHandler.layers}
              {index}
              bind:activeLayerIndex={layerHandler.activeLayerIndex}
            />
          {/each}
        </div>
      </div>

      <!-- The canvas which the user draws on -->
      <div
        style="min-width: {canvasWidth}px; min-height: {canvasHeight}px;"
        class="relative bg-red-200"
      >
        <!-- Initialize background layer that cannot be colored on, but contains the set background color -->
        <Layer
          width={canvasWidth}
          height={canvasHeight}
          {toolHandler}
          layers={layerHandler.layers}
          index={-1}
          selected={false}
          isBackground={true}
        />

        <!-- Renders out all layers with stored ImageData -->
        {#each layerHandler.layers as _, index}
          <Layer
            width={canvasWidth}
            height={canvasHeight}
            {toolHandler}
            bind:layers={layerHandler.layers}
            {index}
            selected={index == layerHandler.activeLayerIndex}
          />
        {/each}
      </div>

      <!-- Tools to the right side of the canvas -->
      <div
        class="grow w-full mx-3 flex flex-col h-full justify-center items-start gap-2"
      >
        {#if tool.color || tool.name == "Eye Dropper"}
          <ColorPicker bind:color={toolHandler.color} />
          <RecentColors {toolHandler} />
        {/if}
        <ToolSettings bind:tool />
      </div>
    </div>
  </div>
{/if}
