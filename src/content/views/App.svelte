<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { sanitizeText, validateText } from '../utils';
  import { useDarkMode } from '../composables/useDarkMode.svelte';
  import Popover from './Popover.svelte';
  import { generateContext } from '../api/llm';

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
  const POPOVER_MAX_HEIGHT = 400;
  const POPOVER_WIDTH = 448;
  const POPOVER_MARGIN = 16;

  function getSelectionText(): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';

    const rawText = selection.toString();

    return sanitizeText(rawText);
  }

  function getSelectionPosition(): { x: number; y: number } {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { x: 0, y: 0 };

    const rect = selection.getRangeAt(0).getBoundingClientRect();

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    const popoverHeight = POPOVER_MAX_HEIGHT;

    if (spaceAbove >= popoverHeight + POPOVER_MARGIN) {
      popoverPlacement = 'top';
    } else if (spaceBelow >= popoverHeight + POPOVER_MARGIN) {
      popoverPlacement = 'bottom';
    } else {
      popoverPlacement = spaceAbove > spaceBelow ? 'top' : 'bottom';
    }

    const centerX = rect.left + rect.width / 2;
    const halfPopoverWidth = POPOVER_WIDTH / 2;

    let x = centerX;
    const minX = halfPopoverWidth + POPOVER_MARGIN;
    const maxX = window.innerWidth - halfPopoverWidth - POPOVER_MARGIN;

    if (x < minX) {
      x = minX;
    } else if (x > maxX) {
      x = maxX;
    }

    const y =
      popoverPlacement === 'top'
        ? rect.top - POPOVER_MARGIN + scrollY
        : rect.bottom + POPOVER_MARGIN + scrollY;

    return { x: x + scrollX, y };
  }

  function startHoldTimer() {
    clearHoldTimer();

    const text = getSelectionText();
    if (!text || !isMouseDown) return;

    if (text.length > MAX_SELECTION_LENGTH) return;

    selectedTextAtMouseDown = text;

    holdTimer = window.setTimeout(() => {
      const currentText = getSelectionText();
      if (
        currentText &&
        currentText === selectedTextAtMouseDown &&
        isMouseDown
      ) {
        selectedText = currentText;
        popoverPosition = getSelectionPosition();
        popoverOpen = true;
        updateDarkMode();
        fetchContext(selectedText);
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

  function handleSelectionChange() {
    if (isMouseDown) {
      getSelectionText() ? startHoldTimer() : clearHoldTimer();
    }
  }

  async function fetchContext(text: string) {
    isLoading = true;
    contextData = null;

    try {
      if (!validateText(text, MAX_SELECTION_LENGTH)) {
        throw new Error('Invalid text selection');
      }

      const sanitizedText = sanitizeText(text);

      const context = await generateContext(sanitizedText);

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
  });

  onDestroy(() => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('selectionchange', handleSelectionChange);
    document.removeEventListener('keydown', handleEscapeKey);
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
