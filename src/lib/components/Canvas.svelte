<script lang="ts">
    import { onMount } from "svelte";
    import type { MouseEventHandler } from "svelte/elements";

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

        context.strokeStyle = brushColor;
        context.lineWidth = brushWidth;

        setOffset();
    });

    function setOffset() {
        const rect = canvas.getBoundingClientRect();
        offsetX = rect.x;
        offsetY = rect.y;
    }

    function startDraw(x: number, y: number) {
        isDrawing = true;

        prevX = x - offsetX;
        prevY = y - offsetY;
    }

    function draw(event) {
        if (isDrawing) {
            const x = event.x - offsetX;
            const y = event.y - offsetY;

            context.beginPath();
            context.moveTo(prevX, prevY);
            context.lineTo(x, y);
            context.closePath();
            context.stroke();

            prevX = x;
            prevY = y;
        }
    }

    function endDraw() {
        isDrawing = false;
    }
</script>

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
