export class Layer {
    imageData: ImageData;
    visible: boolean = $state(true);

    constructor(width: number, height: number) {
        this.imageData = $state(new ImageData(width, height));
    }
}