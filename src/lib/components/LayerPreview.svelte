<script lang="ts">
    import Layer from "./Layer.svelte";

    let {
        width,
        height,
        layers = $bindable(),
        index,
        activeLayerIndex = $bindable(),
    }: {
        width: number;
        height: number;
        layers: Array<ImageData>;
        index: number;
        activeLayerIndex: number;
    } = $props();

    let canvas: HTMLCanvasElement | undefined = $state();

    $effect(() => {
        if (canvas) {
            const context = canvas.getContext("2d") as CanvasRenderingContext2D;
            context.clearRect(0, 0, width, height);

            //
            const tempCanvas: HTMLCanvasElement =
                document.createElement("canvas");
            tempCanvas.width = width * 8;
            tempCanvas.height = height * 8;

            //
            const tempContext = tempCanvas.getContext(
                "2d",
            ) as CanvasRenderingContext2D;
            tempContext.putImageData(layers[index], 0, 0);
            tempContext.scale(1 / 8, 1 / 8);

            context.drawImage(tempCanvas, 0, 0);
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
    {width}
    {height}
    bind:this={canvas}
    onclick={() => {
        activeLayerIndex = index;
    }}
    class="{activeLayerIndex == index
        ? 'border-dashed border-yellow-500'
        : ''} bg-white border-2 rounded-md cursor-pointer hover:border-dashed hover:border-gray-800 hover:opacity-75"
></canvas>
