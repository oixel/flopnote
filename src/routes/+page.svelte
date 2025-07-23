<script lang="ts">
  import Canvas from "$lib/components/Canvas.svelte";
  import {
    Brush,
    Bucket,
    Eraser,
    PaintBrush,
  } from "$lib/scripts/Brushes.svelte";
  import { CommandHandler } from "$lib/scripts/CommandHandler";

  // Define canvas dimensions
  const canvasWidth = 500;
  const canvasHeight = 500;

  // Instantiate a CommandHandler to allow for undo/redo
  const commandHandler = new CommandHandler();

  // Instantiate all the different brushes
  const paintBrush = new PaintBrush(3, "#000000", commandHandler);
  const eraser = new Eraser(6, commandHandler);
  const bucket = new Bucket(commandHandler);

  // Reactive variable storing the currently selected brush / tool
  let brush: Brush = $state(paintBrush);

  // Stores all the keys currently being pressed
  let pressedKeys: Array<string> = [];

  // Handles all keybindings
  function onkeydown(event: KeyboardEvent) {
    // Lowercase the key input to prevent issues when Caps-Lock is on
    const keycode = event.key.toLowerCase();

    // Add newly pressed key to array of all currently pressed keys
    pressedKeys.push(keycode);

    if (event.ctrlKey) {
      switch (keycode) {
        case "z":
          // Allows for undo and redo with Ctrl+Z and Ctrl+Shift+Z
          if (!event.shiftKey) commandHandler.undo();
          else commandHandler.redo();
          break;
        case "y":
          // Allows for redo functionality with Ctrl+Y
          commandHandler.redo();
          break;
      }
    } else {
      switch (keycode) {
        // Enables brush with 'b'
        case "b":
          brush = paintBrush;
          break;
        // Enables eraser with 'e'
        case "e":
          brush = eraser;
          break;
        // Enables bucket with 'g'
        case "g":
          brush = bucket;
          break;
        // Increases current brush/eraser size with up arrow
        case "arrowup":
          brush.changeSize(1);
          break;
        // Decreases current brush/eraser size with down arrow
        case "arrowdown":
          brush.changeSize(-1);
          break;
      }
    }
  }

  // Remove any released keys from list of currently pressed keys
  function onkeyup(event: KeyboardEvent) {
    const keycode = event.key.toLowerCase();
    pressedKeys.splice(pressedKeys.indexOf(keycode), 1);
  }

  // Handles functionality with mouse scroll wheel
  function onwheel(event: WheelEvent) {
    if (pressedKeys.includes("control")) {
      if (brush.usesSize) {
        if (event.deltaY > 0) brush.changeSize(1);
        else brush.changeSize(-1);
      }
    }
  }
</script>

<svelte:window {onkeydown} {onkeyup} {onwheel} />

<div class="flex flex-col h-[100vh] overflow-hidden select-none cursor-default">
  <h1
    class="text-2xl font-medium bg-blue-900 text-white min-w-120 text-center py-3"
  >
    Welcome to flopnote!
  </h1>
  <div class="flex justify-center items-center bg-blue-200 h-full grow">
    <!-- Tools to the left of the canvas -->
    <div class="grow w-full flex flex-col items-end">
      <div
        class="w-9/10 max-w-40 p-2 mx-auto md:mx-2 flex flex-col justify-center items-center bg-blue-900 text-white rounded-md border-2 border-white text-center"
      >
        <!-- Displays currently selected tool -->
        <p class="">
          <b>Tool:</b>
          {brush.name}
        </p>

        <!-- Displays currently selected tool's size (if it uses one) -->
        {#if brush.usesSize}
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
      {#if brush.usesColor}
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
