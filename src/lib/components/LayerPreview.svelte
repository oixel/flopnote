<script lang="ts">
    let {
        canvasWidth,
        canvasHeight,
        scaler,
        layers = $bindable(),
        index,
        activeLayerIndex = $bindable(),
    }: {
        canvasWidth: number;
        canvasHeight: number;
        scaler: number;
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
        const temp: ImageData = layers[index + direction];
        layers[index + direction] = layers[index];
        layers[index] = temp;

        activeLayerIndex = index + direction;
    }

    //
    function deleteLayer(): void {
        layers.splice(activeLayerIndex, 1);
    }
</script>

{#if activeLayerIndex == index}
    <div class="flex justify-center gap-1">
        {#if index != layers.length - 1}
            <button
                onclick={() => swapLayer(1)}
                class="cursor-pointer bg-white rounded-md border-1 min-w-4"
                >↑</button
            >
        {/if}

        {#if layers.length > 1}
            <button
                onclick={deleteLayer}
                class="w-full cursor-pointer bg-red-400 text-white border-black rounded-md border-2 font-bold"
                >X</button
            >
        {/if}

        {#if index != 0}
            <button
                onclick={() => swapLayer(-1)}
                class="cursor-pointer bg-white rounded-md border-1 min-w-4"
                >↓</button
            >
        {/if}
    </div>
{/if}

<canvas
    width={canvasWidth * scaler}
    height={canvasHeight * scaler}
    bind:this={canvas}
    onclick={() => {
        activeLayerIndex = index;
    }}
    class="{activeLayerIndex == index
        ? 'border-dashed border-yellow-500'
        : ''} bg-white border-2 rounded-md cursor-pointer hover:border-dashed hover:border-gray-800 hover:opacity-75"
></canvas>
