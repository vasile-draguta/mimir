<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

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
  let contentElement = $state<HTMLDivElement | null>(null);
  let isScrollbarVisible = $state(true);
  let scrollTimeout: number | null = null;

  const SCROLLBAR_HIDE_DELAY = 2000;

  function handleScroll() {
    isScrollbarVisible = true;

    if (scrollTimeout !== null) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = window.setTimeout(() => {
      isScrollbarVisible = false;
    }, SCROLLBAR_HIDE_DELAY);
  }

  $effect(() => {
    onElementBind?.(popoverElement);
  });

  $effect(() => {
    if (contentElement) {
      const element = contentElement;
      element.addEventListener('scroll', handleScroll);

      scrollTimeout = window.setTimeout(() => {
        isScrollbarVisible = false;
      }, SCROLLBAR_HIDE_DELAY);

      return () => {
        element.removeEventListener('scroll', handleScroll);
        if (scrollTimeout !== null) {
          clearTimeout(scrollTimeout);
        }
      };
    }
  });

  onDestroy(() => {
    if (scrollTimeout !== null) {
      clearTimeout(scrollTimeout);
    }
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
    tabindex="-1"
    onmousedown={(e) => e.stopPropagation()}
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <div class="liquidGlass-effect"></div>
    <div class="liquidGlass-tint"></div>
    <div class="liquidGlass-shine"></div>

    <div
      bind:this={contentElement}
      class="liquidGlass-content"
      class:scrollbar-hidden={!isScrollbarVisible}
    >
      {#if isLoading}
        <div class="loading-container">
          <svg
            role="status"
            aria-label="Loading"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style="animation: mimir-spin 1s linear infinite;"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="31.4 31.4"
              style="opacity: 0.25;"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="31.4 31.4"
              stroke-dashoffset="31.4"
            />
            <title>Loading...</title>
          </svg>
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
