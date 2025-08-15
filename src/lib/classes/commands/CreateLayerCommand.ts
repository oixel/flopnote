import { Command } from "$lib/classes/commands/Command";
import type LayerHandler from "../handlers/LayerHandler.svelte";
import { DeleteLayerCommand } from "./DeleteLayerCommand";

// Handles the creation of layers
export class CreateLayerCommand extends Command {
    constructor(layerHandler: LayerHandler, manualIndex: number | null = null) {
        // The DeleteLayerCommand requires the index where the layer is created to be overwritten
        // If the index is set manually, create a layer *there*
        // Otherwise, use the current layer's index and create the layer above it
        const index = (manualIndex != null) ? manualIndex : layerHandler.activeLayerIndex + 1;

        // Define redo and undo functions
        super(
            // Redo
            function () {
                // Create a new layer at the desired index
                layerHandler.addLayer(index);

                // Select this newly created layer
                layerHandler.activeLayerIndex = index;

            },
            // Undo
            function () {
                // Delete created layer at given index
                new DeleteLayerCommand(layerHandler, index);
            }
        );

        // Call this command's main functionality: creating a new layer
        this.redo();
    }
}
