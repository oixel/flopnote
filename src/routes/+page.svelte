<script lang="ts">
    import Canvas from "$lib/components/Canvas.svelte";
</script>

<div class="flex flex-col h-[100vh] overflow-hidden">
    <h1
        class="text-2xl font-medium bg-blue-900 text-white min-w-120 text-center py-3"
    >
        Welcome to flopnote!
    </h1>
    <div class="flex justify-center items-center bg-blue-200 h-full grow">
        <Canvas
            width={500}
            height={500}
            brushColor={"#000000"}
            brushWidth={3}
        />
    </div>
</div>
