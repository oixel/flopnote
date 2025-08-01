<script lang="ts">
  import Layer from "$lib/components/Layer.svelte";
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

  let selectedLayer = $state(1);
  const maxLayerCount = 3;
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
        <h2 class="mr-3.5 font-bold">Layer:</h2>
        <!-- Layer Controls -->
        <div
          class="w-20 h-20 pl-2 bg-white border-2 rounded-md flex items-center justify-evenly text-2xl font-bold"
        >
          {selectedLayer}

          <div class="flex flex-col gap-1">
            <button
              onclick={() => {
                if (selectedLayer < maxLayerCount) selectedLayer++;
              }}
              class="ml-2 cursor-pointer bg-black text-white h-4 flex items-center justify-center py-3 pb-4 px-1.5 rounded-md"
              >+</button
            >
            <button
              onclick={() => {
                if (selectedLayer > 1) selectedLayer--;
              }}
              class="ml-2 cursor-pointer bg-black text-white h-4 flex items-center justify-center py-3 pb-4 px-1.5 rounded-md"
              >-</button
            >
          </div>
        </div>
      </div>

      <!-- The canvas which the user draws on -->
      <div class="relative min-w-[{canvasWidth}px] min-h-[{canvasHeight}px]">
        <Layer
          width={canvasWidth}
          height={canvasHeight}
          {toolHandler}
          zIndex={0}
          selected={false}
          isBackground={true}
        />
        <Layer
          width={canvasWidth}
          height={canvasHeight}
          {toolHandler}
          zIndex={1}
          selected={selectedLayer == 1}
        />
        <Layer
          width={canvasWidth}
          height={canvasHeight}
          {toolHandler}
          zIndex={2}
          selected={selectedLayer == 2}
        />
        <Layer
          width={canvasWidth}
          height={canvasHeight}
          {toolHandler}
          zIndex={2}
          selected={selectedLayer == 3}
        />
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
