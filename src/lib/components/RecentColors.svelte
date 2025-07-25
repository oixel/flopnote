<script lang="ts">
  import type { ToolHandler } from "$lib/classes/handlers/ToolHandler.svelte";

  let { toolHandler }: { toolHandler: ToolHandler } = $props();
</script>

{#if toolHandler.recentColors.length}
  <div class="w-full h-auto flex border-2">
    {#each toolHandler.recentColors as color (color)}
      <button
        aria-label="Recent color used {color}"
        class="w-1/5 aspect-square h-full cursor-pointer hover:scale-115 hover:z-10 transition-transform duration-100"
        style="background-color: {color};"
        onclick={() => {
          toolHandler.color = color;
        }}
      ></button>
    {/each}
  </div>
{/if}
