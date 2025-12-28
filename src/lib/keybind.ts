import type { KeybindConfig } from './types';

export const DEFAULT_KEYBIND: KeybindConfig = {
  key: 'k',
  ctrl: true,
  meta: true,
  shift: false,
  alt: false,
};

export function isMac(): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function formatKeybind(config: KeybindConfig): string {
  const mac = isMac();
  const parts: string[] = [];

  if (config.ctrl && !mac) parts.push('Ctrl');
  if (config.meta && mac) parts.push('\u2318');
  if (config.alt) parts.push(mac ? '\u2325' : 'Alt');
  if (config.shift) parts.push(mac ? '\u21E7' : 'Shift');

  const keyDisplay = config.key.length === 1 ? config.key.toUpperCase() : config.key;
  parts.push(keyDisplay);

  return mac ? parts.join('') : parts.join('+');
}

export function matchesKeybind(event: KeyboardEvent, config: KeybindConfig): boolean {
  const mac = isMac();

  const expectedCtrl = mac ? false : config.ctrl;
  const expectedMeta = mac ? config.meta : false;

  if (event.ctrlKey !== expectedCtrl) return false;
  if (event.metaKey !== expectedMeta) return false;
  if (event.shiftKey !== config.shift) return false;
  if (event.altKey !== config.alt) return false;

  return event.key.toLowerCase() === config.key.toLowerCase();
}

const RESERVED_SHORTCUTS: Array<{ key: string; shift: boolean; reason: string }> = [
  { key: 't', shift: false, reason: 'New tab' },
  { key: 'w', shift: false, reason: 'Close tab' },
  { key: 'n', shift: false, reason: 'New window' },
  { key: 'q', shift: false, reason: 'Quit browser' },
  { key: 'r', shift: false, reason: 'Refresh page' },
  { key: 'l', shift: false, reason: 'Focus address bar' },
  { key: 'd', shift: false, reason: 'Bookmark page' },
  { key: 'p', shift: false, reason: 'Print page' },
  { key: 's', shift: false, reason: 'Save page' },
  { key: 'f', shift: false, reason: 'Find in page' },
  { key: 'h', shift: false, reason: 'History' },
  { key: 'j', shift: false, reason: 'Downloads' },
  { key: 'a', shift: false, reason: 'Select all' },
  { key: 'c', shift: false, reason: 'Copy' },
  { key: 'v', shift: false, reason: 'Paste' },
  { key: 'x', shift: false, reason: 'Cut' },
  { key: 'z', shift: false, reason: 'Undo' },
  { key: 't', shift: true, reason: 'Reopen closed tab' },
  { key: 'n', shift: true, reason: 'Incognito window' },
  { key: 'p', shift: true, reason: 'Incognito window (Firefox)' },
];

export function getReservedConflict(config: KeybindConfig): string | null {
  const hasMainModifier = config.ctrl || config.meta;
  if (!hasMainModifier) return null;

  const match = RESERVED_SHORTCUTS.find(
    (shortcut) =>
      shortcut.key.toLowerCase() === config.key.toLowerCase() &&
      shortcut.shift === config.shift &&
      !config.alt
  );

  if (match) {
    return `This shortcut is reserved for "${match.reason}"`;
  }

  return null;
}

export function isModifierOnly(event: KeyboardEvent): boolean {
  return ['Control', 'Meta', 'Shift', 'Alt'].includes(event.key);
}

export function keybindFromEvent(event: KeyboardEvent): KeybindConfig {
  return {
    key: event.key.toLowerCase(),
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    shift: event.shiftKey,
    alt: event.altKey,
  };
}
