<script lang="ts">
    import type LayerHandler from "$lib/classes/handlers/LayerHandler.svelte";
    import type { CommandHandler } from "$lib/classes/handlers/CommandHandler";
    import LayerPreview from "./LayerPreview.svelte";
    import { CreateLayerCommand } from "$lib/classes/commands/CreateLayerCommand";
    let {
        canvasWidth,
        canvasHeight,
        layerHandler,
        commandHandler,
    }: {
        canvasWidth: number;
        canvasHeight: number;
        layerHandler: LayerHandler;
        commandHandler: CommandHandler;
    } = $props();
</script>

<div class="grow w-full mx-3 flex flex-col h-full justify-center items-end">
    <div
        style="max-width: {canvasWidth / 4}px;"
        class="flex w-full justify-center gap-2 bg-gray-800 p-2 rounded-t-md"
    >
        <h2 class="select-none font-bold text-xl grow text-white">Layers</h2>
        <button
            onclick={() => {
                commandHandler.addCommand(new CreateLayerCommand(layerHandler));
            }}
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
                {layerHandler}
                {commandHandler}
                {index}
            />
        {/each}
    </div>
</div>
