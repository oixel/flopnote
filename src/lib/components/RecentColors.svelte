<script lang="ts">
  import type { BrushHandler } from "$lib/classes/handlers/BrushHandler.svelte";
  import { getComplementary } from "$lib/scripts/ColorTools";

  let { brushHandler }: { brushHandler: BrushHandler } = $props();
</script>

{#if brushHandler.recentColors.length}
  <div class="w-full h-auto flex border-2">
    {#each brushHandler.recentColors as color (color)}
      <button
        aria-label="Recent color used {color}"
        class="w-1/5 aspect-square h-full cursor-pointer hover:scale-115 hover:z-10 transition-transform duration-100"
        style="background-color: {color};"
        onclick={() => {
          brushHandler.color = color;
        }}
      ></button>
    {/each}
  </div>
{/if}
