<script lang="ts">
  import Canvas from "$lib/components/Canvas.svelte";
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
        class="grow w-full flex flex-col h-full justify-center items-end gap-2"
      ></div>

      <!-- The canvas which the user draws on -->
      <Canvas width={canvasWidth} height={canvasHeight} {toolHandler} />

      <!-- Tools to the right side of the canvas -->
      <div
        class="grow w-full mx-auto md:mx-2 flex flex-col h-full justify-center items-start gap-2"
      >
        {#if tool.color || tool.name == "Eye Dropper"}
          <ColorPicker bind:color={toolHandler.color} />
          <RecentColors {toolHandler} />
        {/if}
        <ToolSettings bind:tool={tool} />
      </div>
    </div>
  </div>
{/if}
