import { Command } from "$lib/classes/commands/Command";
import type LayerHandler from "../handlers/LayerHandler.svelte";
import { CreateLayerCommand } from "./CreateLayerCommand";

// Handles the deletion of layers
export class DeleteLayerCommand extends Command {
    constructor(layerHandler: LayerHandler, manualIndex: number | null = null) {
        const index = (manualIndex) ? manualIndex : layerHandler.activeLayerIndex;
        const imageData = layerHandler.layers[index];

        // Tracks whether the layers became empty on deletion (ensures undo() does not create a unneeded duplicate)
        let wasEmpty = false;

        // Define redo and undo functions
        super(
            // Redo
            function () {
                // Delete currently selected layer
                layerHandler.layers.splice(index, 1);

                // Prevent 0 layers from existing by creating a new layer when empty
                if (layerHandler.layers.length === 0) {
                    new CreateLayerCommand(layerHandler, 0);

                    // Track that layers became empty and, therefore, a new layer has already been created
                    wasEmpty = true;
                }

                // Select layer under deleted layer (if one exists)
                if (index !== 0) layerHandler.activeLayerIndex--;
            },
            // Undo
            function () {
                // Create a new layer in the same spot as the previous layer (if one was not already created on deletion)
                if (!wasEmpty) new CreateLayerCommand(layerHandler, index);

                // Fill the new layer with the deleted layer's ImageData
                layerHandler.layers[index] = imageData;
            }
        );

        // Call this command's main functionality: delete the selected layer
        this.redo();
    }
}
