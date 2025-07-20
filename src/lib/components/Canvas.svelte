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

    // Variables relating to active drawing
    let isDrawing = false;
    let offsetX: number;
    let offsetY: number;
    let prevMouseX: number;
    let prevMouseY: number;

    interface Stroke {
        x: number;
        y: number;
    }

    let undoPointer: number = 0;
    let currentStroke: Array<Stroke> = [];
    let strokes: Array<Array<Stroke>> = [];

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

    // Draw a line stroke from the previous mouse position to the current mouse position
    function draw(prevX: number, prevY: number, x: number, y: number) {
        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(x, y);
        context.closePath();
        context.stroke();
    }

    // Toggle drawing on and grab line stroke's starting position
    function startMouseDraw(event: MouseEvent) {
        // If undo point is not at end of strokes array, wipe all data after it
        strokes.splice(undoPointer);

        // Enable drawing mode
        isDrawing = true;

        // Initialize brush stroke position to wherever the mouse has clicked
        prevMouseX = event.x - offsetX;
        prevMouseY = event.y - offsetY;

        // Add stroke start position to stroke
        currentStroke.push({ x: prevMouseX, y: prevMouseY });
    }

    // Handles drawing as mouse moves around canvas
    function mouseDraw(event: MouseEvent) {
        // Only draw line strokes if mouse is held down
        if (isDrawing) {
            // Grab current mouse position with consideration for offset
            const x = event.x - offsetX;
            const y = event.y - offsetY;

            // Draw out line from previous mouse position to current mouse position
            draw(prevMouseX, prevMouseY, x, y);

            // Update previous mouse position
            prevMouseX = x;
            prevMouseY = y;

            // Append the new points to the array of points form the current stroke
            currentStroke.push({ x, y });
        }
    }

    // Toggle drawing off when mouse is released
    function endDraw() {
        if (isDrawing) {
            isDrawing = false;

            // Append the current stroke to the array of all strokes (if a stroke was actually made and it was not just a click)
            if (currentStroke.length > 2) {
                strokes.push(currentStroke);

                // Move undo pointer to the end of strokes
                undoPointer = strokes.length;
            }

            // Wipe the current stroke point data to reuse the array for the next stroke
            currentStroke = [];
        }
    }

    // Move undo pointer back one (if possible)
    function undo() {
        if (undoPointer) --undoPointer;
        render();
    }

    // Move undo pointer forward one (if possible)
    function redo() {
        if (undoPointer < strokes.length) ++undoPointer;
        render();
    }

    // Takes all currently drawn lines and places them onto the screen
    function render() {
        // Wipe all strokes on canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render out every single brush stroke
        for (let i = 0; i < undoPointer; i++) {
            const stroke = strokes[i];

            // Grab initial brush stroke point
            let prevX = stroke[0].x;
            let prevY = stroke[0].y;

            // Render out every single point for the current stroke
            for (let j = 1; j < stroke.length; j++) {
                const x = stroke[j].x;
                const y = stroke[j].y;

                // Draw a line stroke from the previous mouse position to the current mouse position
                draw(prevX, prevY, x, y);

                prevX = x;
                prevY = y;
            }
        }
    }

    // Handles keyboard shortcut for the Canvas
    function onkeydown(event: KeyboardEvent) {
        if (event.ctrlKey) {
            switch (event.key.toLowerCase()) {
                case "z":
                    // Allows for undo and redo with Ctrl+Z and Ctrl+Shift+Z
                    if (!event.shiftKey) undo();
                    else redo();

                    break;
                case "y":
                    // Allows for redo functionality with Ctrl+Y
                    redo();

                    break;
            }
        }
    }
</script>

<!-- Update offset whenever the window's size is changed -->
<!-- And Handle drawing as mouse is pressed and moved around the window -->
<svelte:window
    onresize={setOffset}
    {onkeydown}
    onmousedown={startMouseDraw}
    onmouseup={endDraw}
    onmousemove={mouseDraw}
/>

<canvas {width} {height} bind:this={canvas} class="bg-white rounded-md">
</canvas>
