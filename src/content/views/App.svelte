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
  let extensionEnabled = $state(true);

  const { updateDarkMode } = useDarkMode(() => popoverElement);

  let holdTimer: number | null = null;
  let isMouseDown = $state(false);
  let selectedTextAtMouseDown = '';

  const HOLD_DURATION = 500;
  const MAX_SELECTION_LENGTH = 1000;

  function startHoldTimer() {
    if (!extensionEnabled) return;
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
        fetchContext(selectionData.context);
        
        popoverOpen = true;
        updateDarkMode();
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

    if (popoverElement && popoverOpen && popoverElement.contains(event.target as Node)) {
      return;
    }

    if (popoverElement && popoverOpen && !popoverElement.contains(event.target as Node)) {
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
    if (!extensionEnabled) return;
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
      
      fetchContext(selectionData.context);
      
      popoverOpen = true;
      updateDarkMode();
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

  onMount(async () => {
    const storage = await chrome.storage.local.get({ enabled: true });
    extensionEnabled = storage.enabled as boolean;

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabled) {
        extensionEnabled = changes.enabled.newValue as boolean;
      }
    });

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
