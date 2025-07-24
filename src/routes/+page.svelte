<script lang="ts">
  import Canvas from "$lib/components/Canvas.svelte";
  import { BrushHandler } from "$lib/scripts/BrushHandler.svelte";
  import {
    Color,
    colorToHex,
    hexToColor,
  } from "$lib/scripts/ColorTools.svelte";
  import { CommandHandler } from "$lib/scripts/CommandHandler";
  import { InputHandler } from "$lib/scripts/InputHandler.svelte";

  // Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

  // Instantiate a CommandHandler to allow for undo/redo
  const commandHandler = new CommandHandler();

  const brushHandler = new BrushHandler(commandHandler);
  let brush = $derived(brushHandler.brush); // Grab the current brush from the brush handler to avoid having to do brushHandler.brush

  // Instantiate an InputHandler to allow for keybinding functionality
  const inputHandler = new InputHandler(commandHandler, brushHandler);

  // Reverts hex color text input back to previous color if a valid hex code is not inputted
  let prevColorInput: string = $derived(
    colorToHex(brushHandler.brush?.color || new Color(0, 0, 0, 255))
  );
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
      <div class="grow w-full flex flex-col items-end">
        <div
          class="min-w-38 max-w-38 p-2 mx-auto md:mx-2 flex flex-col justify-center items-center bg-blue-900 text-white rounded-md border-2 border-white text-center"
        >
          <!-- Displays currently selected tool -->
          <p class="">
            <b>Tool:</b>
            {brush.name}
          </p>

          <!-- Displays currently selected tool's size (if it uses one) -->
          {#if brush.size}
            <p class="border-t-2 border-dashed w-full mt-2 pt-2">
              <b>Size:</b>
              {brush.size}
            </p>

            <input
              type="range"
              min="1"
              max={brush.maxSize}
              bind:value={brush.size}
              class="cursor-pointer"
            />
          {/if}

          {#if brush.color}
            <p>
              <b>Opacity:</b>
              {brush.color.a}
            </p>
            <input
              type="range"
              min="1"
              max="255"
              bind:value={brush.color.a}
              class="cursor-pointer"
            />
          {/if}
        </div>
      </div>

      <!-- The canvas which the user draws on -->
      <Canvas width={canvasWidth} height={canvasHeight} {brushHandler} />

      <!-- Tools to the right side of the canvas -->
      <div
        class="grow w-full h-[{canvasHeight}px] flex flex-col justify-start items-start"
      >
        {#if brush.color || brush.name == "Eye Dropper"}
          <!-- Color Picker -->
          <div
            class="w-9/10 max-w-48 p-2 mx-auto md:mx-2 flex flex-col rounded-md border-2 bg-white"
          >
            <input
              type="color"
              value={colorToHex(brushHandler.color)}
              oninput={(event) => {
                brushHandler.color = hexToColor(
                  event.currentTarget.value,
                  brushHandler.color.a
                );
              }}
              class="w-full h-full rounded-xl aspect-square style cursor-pointer border-solid hover:scale-102 transition-all duration-100"
            />
            <input
              type="text"
              onkeydown={(event) => {
                // Only allows valid hex inputs into the color input
                const hexRegex = /[a-fA-F0-9]+/;
                if (!hexRegex.test(event.key)) event.preventDefault();
              }}
              onfocus={(event) => {
                // Store current input to revert back to it in case of focus lost or improper hex input
                prevColorInput = event.currentTarget.value;
              }}
              oninput={(event) => {
                // Format hex input to be limited to a hashtag followed by six valid chars
                const hexInput =
                  "#" +
                  event.currentTarget.value.slice(1).toLowerCase().slice(0, 6);

                // Apply the formatted input *into* the input field
                event.currentTarget.value = hexInput;

                // If a full hex code has been inputted, apply it!
                if (hexInput.length == 7)
                  brushHandler.color = hexToColor(
                    hexInput,
                    brushHandler.color.a
                  );
              }}
              onchange={(event) => {
                // Prevent improper hex input
                if (event.currentTarget.value.length != 7) {
                  event.currentTarget.value = prevColorInput;
                  brushHandler.color = hexToColor(
                    prevColorInput,
                    brushHandler.color.a
                  );
                }
              }}
              value={colorToHex(brushHandler.color)}
              class="w-full text-center pt-1"
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
