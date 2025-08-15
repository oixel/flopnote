<script lang="ts">
    import type LayerHandler from "$lib/classes/handlers/LayerHandler.svelte";
    import { SelectLayerCommand } from "$lib/classes/commands/SelectLayerCommand";
    import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";
    import { DeleteLayerCommand } from "$lib/classes/commands/DeleteLayerCommand";
    import { SwapLayerCommand } from "$lib/classes/commands/SwapLayerCommand";

    let {
        canvasWidth,
        canvasHeight,
        layerHandler,
        commandHandler,
        index,
    }: {
        canvasWidth: number;
        canvasHeight: number;
        layerHandler: LayerHandler;
        commandHandler: CommandHandler;
        index: number;
    } = $props();

    let canvas: HTMLCanvasElement | undefined = $state();

    $effect(() => {
        if (canvas) {
            const context = canvas.getContext("2d") as CanvasRenderingContext2D;
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            // Create a temporary canvas to place the current layer's ImageData onto
            const tempCanvas: HTMLCanvasElement =
                document.createElement("canvas");
            tempCanvas.width = canvasWidth;
            tempCanvas.height = canvasHeight;

            // Draw the current layer's ImageData onto the temporary layer
            const tempContext = tempCanvas.getContext(
                "2d",
            ) as CanvasRenderingContext2D;
            tempContext.putImageData(layerHandler.layers[index], 0, 0);

            // Render the content of the temporary layer scaled to the dimensions of the layer preview
            context.drawImage(
                tempCanvas,
                0,
                0,
                canvasWidth,
                canvasHeight,
                0,
                0,
                canvas.width,
                canvas.height,
            );
        }
    });
</script>

<div class="relative group">
    <canvas
        style="max-width: {canvasWidth / 4}px;"
        bind:this={canvas}
        onclick={() => {
            // Store layer selection in undo / redo timeline
            commandHandler.addCommand(
                new SelectLayerCommand(layerHandler, index),
            );
        }}
        class="{layerHandler.activeLayerIndex == index
            ? 'border-gray-800 border-4'
            : ''} self-center justify-self-center w-9/10 aspect-square rounded-md bg-white cursor-pointer hover:border-2 hover:border-dashed"
    >
    </canvas>

    <!-- Only show layer settings when hovering on the selected layer -->
    {#if layerHandler.activeLayerIndex == index}
        <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 w-full h-full flex justify-center items-center"
        >
            <!-- Grid that ensures the buttons remain in a 2x2 format -->
            <div class="grid grid-cols-2 gap-2">
                <!-- Button to move selected layer up -->
                <button
                    aria-label="Move layer {index} up one"
                    disabled={index == layerHandler.layers.length - 1}
                    onclick={() =>
                        commandHandler.addCommand(
                            new SwapLayerCommand(
                                layerHandler,
                                layerHandler.activeLayerIndex + 1,
                            ),
                        )}
                    class="relative z-1 w-8 bg-white border-2 rounded-md aspect-square cursor-pointer
                    hover:scale-105 disabled:opacity-50 disabled:cursor-default"
                    >↑</button
                >

                <!-- Button to delete selected layer -->
                <button
                    aria-label="Move layer {index} down one"
                    onclick={() => {
                        commandHandler.addCommand(
                            new DeleteLayerCommand(layerHandler),
                        );
                    }}
                    class="relative z-1 w-8 bg-white border-2 rounded-md aspect-square cursor-pointer hover:scale-105"
                    >X</button
                >

                <!-- Button to move selected layer down -->
                <button
                    aria-label="Move layer {index} down one"
                    disabled={index == 0}
                    onclick={() =>
                        commandHandler.addCommand(
                            new SwapLayerCommand(
                                layerHandler,
                                layerHandler.activeLayerIndex - 1,
                            ),
                        )}
                    class="relative z-1 w-8 bg-white border-2 rounded-md aspect-square cursor-pointer
                    hover:scale-105 disabled:opacity-50 disabled:cursor-default"
                    >↓</button
                >

                <!-- Button to toggle the selected layer's visibility -->
                <button
                    aria-label="Toggle layer's visibility"
                    onclick={() => console.log("Toggled visibility")}
                    class="relative z-1 w-8 bg-white border-2 rounded-md aspect-square cursor-pointer hover:scale-105"
                    >🗹</button
                >
            </div>
        </div>
    {/if}
</div>
