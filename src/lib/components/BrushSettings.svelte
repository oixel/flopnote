<script lang="ts">
  import type { Tool } from "$lib/classes/Tool.svelte";
  import { Bucket } from "$lib/classes/tools/Bucket.svelte";

  let { brush = $bindable() }: { brush: Tool } = $props();
</script>

<div
  class="w-9/10 min-w-38 max-w-48 p-2 flex flex-col justify-center items-center bg-blue-900 text-white rounded-md border-2 border-white text-center"
>
  <!-- Displays currently selected tool -->
  <p class="">
    <b>Tool:</b>
    {brush.name}
  </p>

  <!-- Size slider for tools that use it -->
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

  <!-- Opacity slider for tools that use it -->
  {#if brush.opacity}
    <p>
      <b>Opacity:</b>
      {brush.opacity}
    </p>
    <input
      type="range"
      min="1"
      max="255"
      bind:value={brush.opacity}
      class="cursor-pointer"
    />
  {/if}

  <!-- Threshold slider for bucket tool -->
  {#if brush instanceof Bucket}
    <p>
      <b>Threshold:</b>
      {brush.threshold}
    </p>
    <input
      type="range"
      min="0"
      max="120"
      bind:value={brush.threshold}
      class="cursor-pointer"
    />
  {/if}
</div>
