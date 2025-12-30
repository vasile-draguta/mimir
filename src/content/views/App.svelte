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
  import type { KeybindConfig } from '../../lib/types';
  import { DEFAULT_KEYBIND, matchesKeybind } from '../../lib/keybind';

  let popoverOpen = $state(false);
  let selectedText = $state('');
  let popoverPosition = $state({ x: 0, y: 0 });
  let popoverPlacement = $state<'top' | 'bottom'>('top');
  let contextData = $state<string | null>(null);
  let isLoading = $state(false);
  let popoverElement = $state<HTMLDivElement | null>(null);
  let extensionEnabled = $state(true);
  let currentKeybind = $state<KeybindConfig>(DEFAULT_KEYBIND);

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

    if (popoverOpen) {
      if (popoverElement && popoverElement.contains(event.target as Node)) {
        return;
      }
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

    if (matchesKeybind(event, currentKeybind)) {
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
      const errorMessage =
        (error as Error).message || 'Failed to fetch context';
      contextData = errorMessage;
    } finally {
      isLoading = false;
    }
  }

  function handleElementBind(element: HTMLDivElement | null) {
    popoverElement = element;
  }

  onMount(async () => {
    const storage = await chrome.storage.local.get({
      enabled: true,
      keybind: DEFAULT_KEYBIND,
    });
    extensionEnabled = storage.enabled as boolean;
    currentKeybind = storage.keybind as KeybindConfig;

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabled) {
        extensionEnabled = changes.enabled.newValue as boolean;
      }
      if (changes.keybind) {
        currentKeybind = changes.keybind.newValue as KeybindConfig;
      }
    });

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('keydown', handleEscapeKey, true);
    document.addEventListener('keydown', handleKeybind);
  });

  onDestroy(() => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('selectionchange', handleSelectionChange);
    document.removeEventListener('keydown', handleEscapeKey, true);
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
