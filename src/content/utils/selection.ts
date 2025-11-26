import { sanitizeText } from '../utils';
import type { SelectionContext } from '../api/llm';

export interface TextSelection {
  text: string;
  context: SelectionContext;
}

export interface SelectionPosition {
  x: number;
  y: number;
  placement: 'top' | 'bottom';
}

export interface SelectionConfig {
  contextChars?: number;
  popoverMaxHeight?: number;
  popoverWidth?: number;
  popoverMargin?: number;
  popoverMinSpacing?: number;
}

const DEFAULT_CONFIG: Required<SelectionConfig> = {
  contextChars: 300,
  popoverMaxHeight: 400,
  popoverWidth: 448,
  popoverMargin: 16,
  popoverMinSpacing: 32,
};

const BLOCK_ELEMENTS = [
  'P',
  'DIV',
  'ARTICLE',
  'SECTION',
  'MAIN',
  'LI',
  'TD',
  'TH',
  'BLOCKQUOTE',
  'PRE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
];

function getBlockContainer(node: Node): HTMLElement | null {
  let current: Node | null = node;

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement;
      if (BLOCK_ELEMENTS.includes(element.tagName)) {
        return element;
      }
    }
    current = current.parentNode;
  }

  return node.parentElement || document.body;
}

function findSelectionOffset(
  container: Node | null,
  targetNode: Node,
  targetOffset: number
): number {
  if (!container) return 0;

  let offset = 0;
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node === targetNode) {
      return offset + targetOffset;
    }
    offset += node.textContent?.length || 0;
  }

  return offset;
}

export function getSelectionWithContext(
  config: SelectionConfig = {}
): TextSelection | null {
  const { contextChars } = { ...DEFAULT_CONFIG, ...config };

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const selectedText = selection.toString().trim();
  if (!selectedText) return null;

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;

  const blockContainer = getBlockContainer(container);
  const fullText = blockContainer?.textContent || '';

  const selectionStart = findSelectionOffset(
    blockContainer,
    range.startContainer,
    range.startOffset
  );
  const selectionEnd = findSelectionOffset(
    blockContainer,
    range.endContainer,
    range.endOffset
  );

  const beforeStart = Math.max(0, selectionStart - contextChars);
  const afterEnd = Math.min(fullText.length, selectionEnd + contextChars);

  const textBefore = fullText.substring(beforeStart, selectionStart).trim();
  const textAfter = fullText.substring(selectionEnd, afterEnd).trim();

  return {
    text: sanitizeText(selectedText),
    context: {
      selected: sanitizeText(selectedText),
      before: textBefore ? sanitizeText(textBefore) : undefined,
      after: textAfter ? sanitizeText(textAfter) : undefined,
    },
  };
}

export function getSelectionText(config: SelectionConfig = {}): string {
  const result = getSelectionWithContext(config);
  return result?.text || '';
}

export function getSelectionPosition(
  config: SelectionConfig = {}
): SelectionPosition | null {
  const { popoverMaxHeight, popoverWidth, popoverMargin, popoverMinSpacing } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const rect = selection.getRangeAt(0).getBoundingClientRect();

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;

  const requiredSpace = popoverMaxHeight + popoverMinSpacing;

  let placement: 'top' | 'bottom';
  if (spaceAbove >= requiredSpace) {
    placement = 'top';
  } else if (spaceBelow >= requiredSpace) {
    placement = 'bottom';
  } else {
    placement = spaceAbove > spaceBelow ? 'top' : 'bottom';
  }

  const centerX = rect.left + rect.width / 2;
  const halfPopoverWidth = popoverWidth / 2;

  let x = centerX;
  const minX = halfPopoverWidth + popoverMargin;
  const maxX = window.innerWidth - halfPopoverWidth - popoverMargin;

  if (x < minX) {
    x = minX;
  } else if (x > maxX) {
    x = maxX;
  }

  const y =
    placement === 'top'
      ? rect.top - popoverMinSpacing + scrollY
      : rect.bottom + popoverMinSpacing + scrollY;

  return { x: x + scrollX, y, placement };
}
