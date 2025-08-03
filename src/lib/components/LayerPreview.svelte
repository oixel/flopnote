<script lang="ts">
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
</script>

{#if activeLayerIndex == index}
    <button
        class="cursor-pointer bg-white rounded-md border-1 w-fit self-center px-1.5 font-bold"
        >O</button
    >
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
