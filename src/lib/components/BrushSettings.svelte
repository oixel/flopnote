<script lang="ts">
    let { brush = $bindable() } = $props();
</script>

<div
    class="min-w-38 max-w-38 p-2 mx-auto md:mx-2 flex flex-col justify-center items-center bg-blue-900 text-white rounded-md border-2 border-white text-center"
>
    <!-- Displays currently selected tool -->
    <p class="">
        <b>Tool:</b>
        {brush.name}
    </p>

    <!-- Displays currently selected tool's size (if it uses one) -->
    {#if brush.size}
        <p class="border-t-2 border-dashed w-full mt-2 pt-2">
            <b>Size:</b>
            {brush.size}
        </p>

        <input
            type="range"
            min="1"
            max={brush.maxSize}
            bind:value={brush.size}
            class="cursor-pointer"
        />
    {/if}

    <!-- Only display opacity setting if the brush uses it -->
    {#if brush.color}
        <p>
            <b>Opacity:</b>
            {brush.color.a}
        </p>
        <input
            type="range"
            min="1"
            max="255"
            bind:value={brush.color.a}
            class="cursor-pointer"
        />
    {/if}
</div>
