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
      duration: 200,
      opacity: 0,
    }}
    class="mimir-popover"
    style="
      position: absolute;
      left: {position.x}px;
      top: {position.y}px;
      transform: translate(-50%, {placement === 'top' ? '-100%' : '0%'});
      z-index: 999999;
      pointer-events: auto;
      max-height: calc(100vh - 32px);
      overflow-y: auto;
      width: 448px;
      max-width: calc(100vw - 32px);
      background: var(--background);
      color: var(--foreground);
      border: 1px solid var(--border);
      border-radius: 6px;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      padding: 20px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.5;
    "
    role="dialog"
    aria-label="Context information"
  >
    <div>
      {#if isLoading}
        <div
          style="display: flex; align-items: center; justify-content: center; padding: 16px 0;"
        >
          <div
            style="
              animation: spin 1s linear infinite;
              width: 20px;
              height: 20px;
              border: 2px solid currentColor;
              border-top-color: transparent;
              border-radius: 50%;
            "
            role="status"
            aria-label="Loading"
          >
            <span
              style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;"
              >Loading...</span
            >
          </div>
        </div>
      {:else if contextData}
        <div>
          <p
            style="color: var(--foreground); white-space: pre-wrap; font-size: 14px; line-height: 1.6; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;"
          >
            {contextData}
          </p>
        </div>
      {:else}
        <p style="color: var(--muted-foreground);">Loading...</p>
      {/if}
    </div>
  </div>
{/if}
