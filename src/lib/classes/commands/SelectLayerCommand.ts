import { Command } from "$lib/classes/commands/Command";
import type LayerHandler from "../handlers/LayerHandler.svelte";

// Handles selecting a new layer
export class SelectLayerCommand extends Command {
    constructor(layerHandler: LayerHandler, newIndex: number) {
        // Store the current index to prevent losing the data on activeLayerIndex change
        const index = layerHandler.activeLayerIndex;

        // Define redo and undo functions
        super(
            // Redo
            function () {
                layerHandler.activeLayerIndex = newIndex;
            },
            // Undo
            function () {
                layerHandler.activeLayerIndex = index;
            }
        );

        // Call this command's main functionality: select the clicked layer
        this.redo();
    }
}
