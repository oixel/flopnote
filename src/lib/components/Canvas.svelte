<script lang="ts">
    import { onMount } from "svelte";

    let {
        width,
        height,
        brushColor,
        brushWidth,
    }: {
        width: number;
        height: number;
        brushColor: string;
        brushWidth: number;
    } = $props();

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    let isDrawing = false;
    let offsetX: number;
    let offsetY: number;
    let prevX: number;
    let prevY: number;

    onMount(() => {
        context = canvas.getContext("2d") as CanvasRenderingContext2D;

        // Initialize brush attributes to current brush values
        context.strokeStyle = brushColor;
        context.lineWidth = brushWidth;

        // Initialize canvas' offset
        setOffset();
    });

    // Ensures that mouse pointer is correctly offset to within the Canvas element
    function setOffset() {
        const rect = canvas.getBoundingClientRect();
        offsetX = rect.x;
        offsetY = rect.y;
    }

    // Toggle drawing on and grab line stroke's starting position
    function startDraw(event: MouseEvent) {
        isDrawing = true;

        prevX = event.x - offsetX;
        prevY = event.y - offsetY;
    }

    // Handles drawing as mouse moves around canvas
    function draw(event: MouseEvent) {
        // Only draw line strokes if mouse is held down
        if (isDrawing) {
            // Grab current mouse position with consideration for offset
            const x = event.x - offsetX;
            const y = event.y - offsetY;

            // Draw a line stroke from the previous mouse position to the current mouse position
            context.beginPath();
            context.moveTo(prevX, prevY);
            context.lineTo(x, y);
            context.closePath();
            context.stroke();

            // Update previous mouse position
            prevX = x;
            prevY = y;
        }
    }

    // Toggle drawing off when mouse is released
    function endDraw() {
        isDrawing = false;
    }
</script>

<!-- Update offset whenever the window's size is changed -->
<svelte:window onresize={setOffset} />

<canvas
    {width}
    {height}
    bind:this={canvas}
    onmousedown={startDraw}
    onmousemove={draw}
    onmouseup={endDraw}
    class="bg-white rounded-md"
>
</canvas>
