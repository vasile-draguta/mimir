<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { validateText } from '../utils';
  import { useDarkMode } from '../composables/useDarkMode.svelte';
  import Popover from './Popover.svelte';
  import { generateContext, type SelectionContext } from '../api/llm';
  import {
    getSelectionWithContext,
    getSelectionText,
    getSelectionPosition,
  } from '../utils/selection';

  let popoverOpen = $state(false);
  let selectedText = $state('');
  let popoverPosition = $state({ x: 0, y: 0 });
  let popoverPlacement = $state<'top' | 'bottom'>('top');
  let contextData = $state<string | null>(null);
  let isLoading = $state(false);
  let popoverElement = $state<HTMLDivElement | null>(null);

  const { updateDarkMode } = useDarkMode(() => popoverElement);

  let holdTimer: number | null = null;
  let isMouseDown = $state(false);
  let selectedTextAtMouseDown = '';

  const HOLD_DURATION = 500;
  const MAX_SELECTION_LENGTH = 1000;

  function startHoldTimer() {
    clearHoldTimer();

    const text = getSelectionText();
    if (!text || !isMouseDown) return;

    if (text.length > MAX_SELECTION_LENGTH) return;

    selectedTextAtMouseDown = text;

    holdTimer = window.setTimeout(() => {
      const selectionData = getSelectionWithContext();
      const position = getSelectionPosition();

      if (
        selectionData &&
        position &&
        selectionData.text === selectedTextAtMouseDown &&
        isMouseDown
      ) {
        selectedText = selectionData.text;
        popoverPosition = { x: position.x, y: position.y };
        popoverPlacement = position.placement;
        popoverOpen = true;
        updateDarkMode();
        fetchContext(selectionData.context);
      }
    }, HOLD_DURATION);
  }

  function clearHoldTimer() {
    if (holdTimer !== null) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function handleMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;

    if (popoverElement && !popoverElement.contains(event.target as Node)) {
      popoverOpen = false;
      return;
    }

    isMouseDown = true;

    if (getSelectionText()) {
      startHoldTimer();
    }
  }

  function handleMouseUp() {
    isMouseDown = false;
    clearHoldTimer();
  }

  function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      popoverOpen = false;
      handleMouseUp();
    }
  }

  function handleKeybind(event: KeyboardEvent) {
    if (
      event.key === 'k' &&
      event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey
    ) {
      event.preventDefault();

      const selectionData = getSelectionWithContext();
      const position = getSelectionPosition();

      if (
        !selectionData ||
        !position ||
        selectionData.text.length > MAX_SELECTION_LENGTH
      ) {
        return;
      }

      selectedText = selectionData.text;
      popoverPosition = { x: position.x, y: position.y };
      popoverPlacement = position.placement;
      updateDarkMode();
      fetchContext(selectionData.context);
      popoverOpen = true;
    }
  }

  function handleSelectionChange() {
    if (isMouseDown) {
      getSelectionText() ? startHoldTimer() : clearHoldTimer();
    }
  }

  async function fetchContext(selectionContext: SelectionContext) {
    isLoading = true;
    contextData = null;

    try {
      if (!validateText(selectionContext.selected, MAX_SELECTION_LENGTH)) {
        throw new Error('Invalid text selection');
      }

      const context = await generateContext(selectionContext);

      contextData = context;
    } catch (error) {
      console.error('[Mimir] Fetch error:', error);
      contextData = 'Failed to fetch context';
    } finally {
      isLoading = false;
    }
  }

  function handleElementBind(element: HTMLDivElement | null) {
    popoverElement = element;
  }

  onMount(() => {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleKeybind);
  });

  onDestroy(() => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('selectionchange', handleSelectionChange);
    document.removeEventListener('keydown', handleEscapeKey);
    document.removeEventListener('keydown', handleKeybind);
    if (holdTimer !== null) {
      clearTimeout(holdTimer);
    }
  });
</script>

<Popover
  isOpen={popoverOpen && !!selectedText}
  position={popoverPosition}
  placement={popoverPlacement}
  {isLoading}
  {contextData}
  onElementBind={handleElementBind}
/>
