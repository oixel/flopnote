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

    $effect(() => {
        if (layerHandler.layers.length == 0) createLayer();
    });

    // Create a new layer above the currently selected layer and move up to it
    function createLayer() {
        // Create a new layer above the current layer
        layerHandler.layers.push(new ImageData(canvasWidth, canvasHeight));

        // Select this newly created layer
    }
</script>

<div class="grow w-full mx-3 flex flex-col h-full justify-center items-end">
    <div
        style="max-width: {canvasWidth / 4}px;"
        class="flex w-full justify-center gap-2 bg-gray-800 p-2 rounded-t-md"
    >
        <h2 class="select-none font-bold text-xl grow text-white">Layers</h2>
        <button
            onclick={createLayer}
            class="bg-white w-7 aspect-square rounded-md cursor-pointer hover:border-1 font-bold"
            >+</button
        >
    </div>

    <div
        style="scrollbar-width: none; max-width: {canvasWidth / 4}px;"
        class="flex flex-col-reverse max-h-70 overflow-auto gap-1 bg-gray-500 pt-2 pb-2 rounded-b-md"
    >
        {#each layerHandler.layers as _, index}
            <LayerPreview
                {canvasWidth}
                {canvasHeight}
                layers={layerHandler.layers}
                {index}
                bind:activeLayerIndex={layerHandler.activeLayerIndex}
            />
        {/each}
    </div>
</div>
