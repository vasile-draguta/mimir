<script lang="ts">
  import { fly } from 'svelte/transition';

  interface Props {
    isOpen: boolean;
    position: { x: number; y: number };
    placement: 'top' | 'bottom';
    isLoading: boolean;
    contextData: string | null;
    onElementBind?: (element: HTMLDivElement | null) => void;
  }

  let {
    isOpen,
    position,
    placement,
    isLoading,
    contextData,
    onElementBind,
  }: Props = $props();

  let popoverElement = $state<HTMLDivElement | null>(null);

  $effect(() => {
    onElementBind?.(popoverElement);
  });
</script>

{#if isOpen}
  <div
    bind:this={popoverElement}
    transition:fly={{
      y: placement === 'top' ? -10 : 10,
      duration: 300,
      opacity: 0,
    }}
    class="mimir-popover liquidGlass-wrapper"
    style="
      position: absolute;
      left: {position.x}px;
      top: {position.y}px;
      transform: translate(-50%, {placement === 'top' ? '-100%' : '0%'});
      z-index: 999999;
      pointer-events: auto;
      width: 448px;
      max-width: calc(100vw - 32px);
    "
    role="dialog"
    aria-label="Context information"
  >
    <div class="liquidGlass-effect"></div>
    <div class="liquidGlass-tint"></div>
    <div class="liquidGlass-shine"></div>

    <div class="liquidGlass-content">
      {#if isLoading}
        <div class="loading-container">
          <div class="spinner" role="status" aria-label="Loading">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      {:else if contextData}
        <div class="content-text">
          <p>{contextData}</p>
        </div>
      {:else}
        <p class="loading-text">Loading...</p>
      {/if}
    </div>
  </div>
{/if}
