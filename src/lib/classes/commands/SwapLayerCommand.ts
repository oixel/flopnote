import { Command } from "$lib/classes/commands/Command";
import type LayerHandler from "../handlers/LayerHandler.svelte";
import type { Layer } from "../Layer.svelte";

// Handles the swapping of two layers
export class SwapLayerCommand extends Command {
    constructor(layerHandler: LayerHandler, swapIndex: number) {
        // Store the current index to prevent losing the data on activeLayerIndex change
        const index = layerHandler.activeLayerIndex;

        function swap(indexA: number, indexB: number): void {
            // Swap the ImageData of the two layers
            const temp: Layer = layerHandler.layers[indexB];
            layerHandler.layers[indexB] = layerHandler.layers[indexA];
            layerHandler.layers[indexA] = temp;

            // Re-select the previously selected layer at its new spot in the hierarchy
            layerHandler.activeLayerIndex = indexB;
        }

        // Define redo and undo functions
        super(
            // Redo
            function () {
                // Prevent attempting to swap two layers if not in bounds
                if (swapIndex < 0 || swapIndex >= layerHandler.layers.length) return;

                // Carry out swapping the two layers
                swap(index, swapIndex);
            },
            // Undo
            function () {
                // Undo the previous swap
                swap(swapIndex, index);
            }
        );

        // Call this command's main functionality: swapping two layers
        this.redo();
    }
}
