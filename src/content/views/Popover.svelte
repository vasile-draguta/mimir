<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
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

  function scaleOnly(
    _node: Element,
    { duration = 300, start = 0.95 }: { duration?: number; start?: number } = {},
  ) {
    return {
      duration,
      easing: cubicOut,
      css: (t: number) => {
        const scale = start + (1 - start) * t;
        return `transform: translate(-50%, ${placement === 'top' ? '-100%' : '0%'}) scale(${scale})`;
      },
    };
  }

  function handleScroll() {
    isScrollbarVisible = true;
    clearScrollTimeout();
    scrollTimeout = window.setTimeout(() => {
      isScrollbarVisible = false;
    }, SCROLLBAR_HIDE_DELAY);
  }

  function clearScrollTimeout() {
    if (scrollTimeout !== null) {
      clearTimeout(scrollTimeout);
      scrollTimeout = null;
    }
  }

  $effect(() => {
    onElementBind?.(popoverElement);
  });

  $effect(() => {
    if (!contentElement) return;

    const element = contentElement;
    element.addEventListener('scroll', handleScroll);

    scrollTimeout = window.setTimeout(() => {
      isScrollbarVisible = false;
    }, SCROLLBAR_HIDE_DELAY);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearScrollTimeout();
    };
  });

  onDestroy(clearScrollTimeout);
</script>

{#if isOpen}
  <div
    bind:this={popoverElement}
    in:scaleOnly={{
      duration: 300,
      start: 0.95,
    }}
    out:scaleOnly={{
      duration: 150,
      start: 0.95,
    }}
    class="mimir-popover liquidGlass-wrapper"
    class:placement-top={placement === 'top'}
    class:placement-bottom={placement === 'bottom'}
    style:position="absolute"
    style:left="{position.x}px"
    style:top="{position.y}px"
    style:z-index="999999"
    style:pointer-events="auto"
    style:width="448px"
    style:max-width="calc(100vw - 32px)"
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
      class="liquidGlass-content-wrapper"
      in:fly={{
        y: placement === 'top' ? -10 : 10,
        duration: 300,
        opacity: 0,
      }}
      out:fly={{
        y: placement === 'top' ? -10 : 10,
        duration: 150,
        opacity: 0,
      }}
    >

      {#if isLoading}
        <div class="loading-container">
          <div class="spinner" role="status" aria-label="Loading">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      {:else if contextData}
        <div
          bind:this={contentElement}
          class="liquidGlass-content"
          class:scrollbar-hidden={!isScrollbarVisible}
        >
          <div class="content-text">
            <p>{contextData}</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
