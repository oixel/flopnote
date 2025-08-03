export default class LayerHandler {
    width: number = 0;
    height: number = 0;

    // Stores the ImageData of each layer and renders n layers, where n = quantity of ImageData
    layers: Array<ImageData> = $state([]);

    // Stores the index of the currently selected layer in the layers array
    activeLayerIndex: number = $state(0);

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.layers = [new ImageData(width, height)];
    }
}
