import { Layer } from "$lib/classes/Layer.svelte";

export default class LayerHandler {
    width: number = 0;
    height: number = 0;

    // Stores the ImageData of each layer and renders n layers, where n = quantity of ImageData
    layers: Array<Layer> = $state([]);

    // Stores the index of the currently selected layer in the layers array
    activeLayerIndex: number = $state(0);

    // Create a new layer and add it at given index
    addLayer(index: number): void {
        const newLayer = new Layer(this.width, this.height);
        this.layers.splice(index, 0, newLayer);
    }

    // Delete layer at given index
    deleteLayer(index: number): void {
        this.layers.splice(index, 1);
    }

    // Returns the visibility status of the layer at a given index or the active layer if none is given
    getVisibility(manualIndex: number | null = null): boolean {
        const index = (manualIndex != null) ? manualIndex : this.activeLayerIndex;
        return this.layers[index].visible;
    }

    // Toggle the visibility status of a specific layer
    toggleVisibility(index: number): void {
        this.layers[index].visible = !this.getVisibility(index);
    }

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.addLayer(0);
    }
}
