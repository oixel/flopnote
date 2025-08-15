<script lang="ts">
    let {
        canvasWidth,
        canvasHeight,
        layers = $bindable(),
        index,
        activeLayerIndex = $bindable(),
    }: {
        canvasWidth: number;
        canvasHeight: number;
        layers: Array<ImageData>;
        index: number;
        activeLayerIndex: number;
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
            tempContext.putImageData(layers[index], 0, 0);

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

    //
    function swapLayer(direction: -1 | 1): void {
        //
        var swapIndex = index + direction;

        // Prevent attempting to swap two layers if not in bounds
        if (swapIndex < 0 || swapIndex >= layers.length) return;

        //
        const temp: ImageData = layers[swapIndex];
        layers[index + direction] = layers[index];
        layers[index] = temp;

        //
        activeLayerIndex = index + direction;
    }

    // Delete currently selected layer
    function deleteLayer() {
        layers.splice(activeLayerIndex, 1);
    }
</script>

<div class="relative group">
    <canvas
        style="max-width: {canvasWidth / 4}px;"
        bind:this={canvas}
        onclick={() => {
            activeLayerIndex = index;
        }}
        class="{activeLayerIndex == index
            ? 'border-red-500 border-4'
            : ''} self-center justify-self-center w-9/10 aspect-square border-2 rounded-md bg-white cursor-pointer hover:border-dashed"
    >
    </canvas>

    <!-- Only show layer settings when hovering on the selected layer -->
    {#if activeLayerIndex == index}
        <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 w-full h-full flex justify-center items-center"
        >
            <!-- Grid that ensures the buttons remain in a 2x2 format -->
            <div class="grid grid-cols-2 gap-2">
                <!-- Button to move selected layer up -->
                <button
                    aria-label="Move layer {index} up one"
                    onclick={() => swapLayer(1)}
                    class="relative z-1 w-8 bg-white border-2 rounded-md aspect-square cursor-pointer hover:scale-105"
                    >↑</button
                >

                <!-- Button to delete selected layer -->
                <button
                    aria-label="Move layer {index} down one"
                    onclick={deleteLayer}
                    class="relative z-1 w-8 bg-white border-2 rounded-md aspect-square cursor-pointer hover:scale-105"
                    >X</button
                >

                <!-- Button to move selected layer down -->
                <button
                    aria-label="Move layer {index} down one"
                    onclick={() => swapLayer(-1)}
                    class="relative z-1 w-8 bg-white border-2 rounded-md aspect-square cursor-pointer hover:scale-105"
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
