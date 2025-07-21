<script lang="ts">
    import Canvas from "$lib/components/Canvas.svelte";

    let isBrush = $state(true);
    let brushSize = $state(3);

    function onkeydown(event: KeyboardEvent) {
        // Allows enabling brush with 'b' or eraser with 'e'
        if (event.key == "b") isBrush = true;
        else if (event.key == "e") isBrush = false;
        
        if (event.key == "ArrowUp") brushSize++;
        else if (event.key == "ArrowDown") brushSize--;
    }
</script>

<svelte:window {onkeydown} />

<div class="flex flex-col h-[100vh] overflow-hidden">
    <h1
        class="text-2xl font-medium bg-blue-900 text-white min-w-120 text-center py-3 select-none"
    >
        Welcome to flopnote!
    </h1>
    <div class="flex justify-center items-center bg-blue-200 h-full grow">
        <Canvas
            width={500}
            height={500}
            isBrush={isBrush}
            brushColor={"#000000"}
            brushSize={brushSize}
        />
    </div>
</div>
