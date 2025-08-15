import { SvelteMap } from "svelte/reactivity";

export default class LayerHandler {
    width: number = 0;
    height: number = 0;

    // Stores the ImageData of each layer and renders n layers, where n = quantity of ImageData
    layers: Array<ImageData> = $state([]);

    // Stores the visibility status of each layer
    visibility: Map<ImageData, boolean> = $state(new SvelteMap());

    // Stores the index of the currently selected layer in the layers array
    activeLayerIndex: number = $state(0);

    // Create a new layer and ensures it has a visibility status
    addLayer(index: number): void {
        const newImageData = new ImageData(this.width, this.height);
        this.layers.splice(index, 0, newImageData);

        // Create a visibility status for this layer
        this.visibility.set(newImageData, true);

    }

    // Delete layer at given index and remove its visibility status
    deleteLayer(index: number): void {
        const deletedImageData = this.layers.splice(index, 1);
        this.visibility.delete(deletedImageData[0]);
    }

    //
    updateKey(index: number): void {
        this.visibility.set(this.layers[index], true);
        console.log(this.visibility);
    }

    // Returns the visibility status of the layer at a given index or the active layer if none is given
    getVisibility(manualIndex: number | null = null): boolean {
        const index = (manualIndex != null) ? manualIndex : this.activeLayerIndex;
        return this.visibility.get(this.layers[index]) as boolean;
    }

    // Toggle the visibility status of a specific layer
    toggleVisibility(index: number): void {
        this.visibility.set(this.layers[index], !this.getVisibility(index));
    }

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.addLayer(0);
    }
}
