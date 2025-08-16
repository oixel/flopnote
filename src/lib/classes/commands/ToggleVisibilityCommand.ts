import { Command } from "$lib/classes/commands/Command";
import type LayerHandler from "../handlers/LayerHandler.svelte";

// Handles the toggling of the selected layer's visibility
export class ToggleVisibilityCommand extends Command {
    constructor(layerHandler: LayerHandler) {
        // Store the current index to prevent losing the data on activeLayerIndex change
        const index = layerHandler.activeLayerIndex;

        // Define redo and undo functions
        super(
            // Redo
            function () {
                // Toggle the layer's visibility
                layerHandler.toggleVisibility(index);
            },
            // Undo
            function () {
                // Toggle the layer's visibility back to previous state!
                layerHandler.toggleVisibility(index);
            }
        );

        // Call this command's main functionality: toggling the selected layer's visibility
        this.redo();
    }
}
