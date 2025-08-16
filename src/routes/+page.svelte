<script lang="ts">
  import { InputHandler } from "$lib/classes/handlers/InputHandler.svelte";
  import { CommandHandler } from "$lib/classes/handlers/CommandHandler";
  import { ToolHandler } from "$lib/classes/handlers/ToolHandler.svelte";
  import ToolSettings from "$lib/components/ToolSettings.svelte";
  import ColorPicker from "$lib/components/ColorPicker.svelte";
  import RecentColors from "$lib/components/RecentColors.svelte";
  import LayerHandler from "$lib/classes/handlers/LayerHandler.svelte";
  import LayerCanvas from "$lib/components/LayerCanvas.svelte";
  import LayerControls from "$lib/components/LayerControls.svelte";

  // Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

  // Instantiate a CommandHandler to allow for undo/redo
  const commandHandler = new CommandHandler();

  const toolHandler = new ToolHandler(commandHandler); // Manages the current tool and data across all tools
  let tool = $derived(toolHandler.tool); // Grab the current tool from the tool handler to avoid having to do toolHandler.tool every time I desire to access it

  // Instantiate an InputHandler to allow for keyboard shortcuts
  const inputHandler = new InputHandler(commandHandler, toolHandler);

  // Instantiate a LayerHander to manage the data of all the different layers
  let layerHandler = new LayerHandler(canvasWidth, canvasHeight);
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
      <LayerControls
        {canvasWidth}
        {canvasHeight}
        {layerHandler}
        {commandHandler}
      />

      <!-- The canvas which the user draws on -->
      <div
        style="min-width: {canvasWidth}px; min-height: {canvasHeight}px;"
        class="relative"
      >
        <!-- Initialize background layer that cannot be colored on, but contains the set background color -->
        <LayerCanvas
          width={canvasWidth}
          height={canvasHeight}
          {toolHandler}
          {layerHandler}
          index={-1}
          selected={false}
          isBackground={true}
        />

        <!-- Renders out all layers with stored ImageData -->
        {#each layerHandler.layers as _, index}
          <LayerCanvas
            width={canvasWidth}
            height={canvasHeight}
            {toolHandler}
            {layerHandler}
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
