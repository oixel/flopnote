<script lang="ts">
    import type LayerHandler from "$lib/classes/handlers/LayerHandler.svelte";
    import LayerPreview from "./LayerPreview.svelte";
    let {
        layerHandler,
        canvasWidth,
        canvasHeight,
    }: {
        layerHandler: LayerHandler;
        canvasWidth: number;
        canvasHeight: number;
    } = $props();
</script>

<div
    class="grow w-full mx-3 flex flex-col h-full justify-center items-end gap-2"
>
    <h2 class="mr-2 font-bold">[ Layers ]</h2>
    <button
        onclick={() => {
            layerHandler.layers.push(new ImageData(canvasWidth, canvasHeight));
            layerHandler.activeLayerIndex;
        }}
        class="bg-white w-12 mr-4.5 pb-0.5 rounded-md cursor-pointer hover:border-1"
        >+</button
    >
    <!-- Layer Controls -->
    <div
        style="scrollbar-width: none;"
        class="flex flex-col-reverse max-h-70 overflow-auto gap-1 mr-2.25 bg-red-200"
    >
        {#each layerHandler.layers as _, index}
            <LayerPreview
                {canvasWidth}
                {canvasHeight}
                scaler={1 / 8}
                layers={layerHandler.layers}
                {index}
                bind:activeLayerIndex={layerHandler.activeLayerIndex}
            />
        {/each}
    </div>
</div>
