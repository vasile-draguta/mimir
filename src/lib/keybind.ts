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

type Platform = 'mac' | 'windows' | 'all';

const RESERVED_SHORTCUTS: Array<{
  key: string;
  shift: boolean;
  alt: boolean;
  reason: string;
  platform: Platform;
}> = [
  // Browser shortcuts (cross-platform)
  { key: 't', shift: false, alt: false, reason: 'New tab', platform: 'all' },
  { key: 'w', shift: false, alt: false, reason: 'Close tab', platform: 'all' },
  { key: 'n', shift: false, alt: false, reason: 'New window', platform: 'all' },
  { key: 'q', shift: false, alt: false, reason: 'Quit browser', platform: 'all' },
  { key: 'r', shift: false, alt: false, reason: 'Refresh page', platform: 'all' },
  { key: 'l', shift: false, alt: false, reason: 'Focus address bar', platform: 'all' },
  { key: 'd', shift: false, alt: false, reason: 'Bookmark page', platform: 'all' },
  { key: 'p', shift: false, alt: false, reason: 'Print page', platform: 'all' },
  { key: 's', shift: false, alt: false, reason: 'Save page', platform: 'all' },
  { key: 'f', shift: false, alt: false, reason: 'Find in page', platform: 'all' },
  { key: 'g', shift: false, alt: false, reason: 'Find next', platform: 'all' },
  { key: 'j', shift: false, alt: false, reason: 'Downloads', platform: 'all' },
  { key: 'o', shift: false, alt: false, reason: 'Open file', platform: 'all' },
  { key: 'u', shift: false, alt: false, reason: 'View source', platform: 'all' },
  { key: 'e', shift: false, alt: false, reason: 'Search selected text', platform: 'all' },
  { key: '[', shift: false, alt: false, reason: 'Go back', platform: 'all' },
  { key: ']', shift: false, alt: false, reason: 'Go forward', platform: 'all' },
  { key: '0', shift: false, alt: false, reason: 'Reset zoom', platform: 'all' },
  { key: '=', shift: false, alt: false, reason: 'Zoom in', platform: 'all' },
  { key: '+', shift: false, alt: false, reason: 'Zoom in', platform: 'all' },
  { key: '-', shift: false, alt: false, reason: 'Zoom out', platform: 'all' },

  // Mac-specific shortcuts
  { key: 'h', shift: false, alt: false, reason: 'Hide window', platform: 'mac' },
  { key: 'm', shift: false, alt: false, reason: 'Minimize window', platform: 'mac' },
  { key: ',', shift: false, alt: false, reason: 'Preferences', platform: 'mac' },
  { key: 'i', shift: false, alt: false, reason: 'Email page', platform: 'mac' },
  { key: 'y', shift: false, alt: false, reason: 'History', platform: 'mac' },

  // Windows-specific shortcuts
  { key: 'h', shift: false, alt: false, reason: 'History', platform: 'windows' },
  { key: 'y', shift: false, alt: false, reason: 'Redo', platform: 'windows' },

  // Common text editing (cross-platform)
  { key: 'a', shift: false, alt: false, reason: 'Select all', platform: 'all' },
  { key: 'c', shift: false, alt: false, reason: 'Copy', platform: 'all' },
  { key: 'v', shift: false, alt: false, reason: 'Paste', platform: 'all' },
  { key: 'x', shift: false, alt: false, reason: 'Cut', platform: 'all' },
  { key: 'z', shift: false, alt: false, reason: 'Undo', platform: 'all' },
  { key: 'z', shift: true, alt: false, reason: 'Redo', platform: 'mac' },
  { key: 'b', shift: false, alt: false, reason: 'Bold text', platform: 'all' },

  // Shift combinations (cross-platform)
  { key: 't', shift: true, alt: false, reason: 'Reopen closed tab', platform: 'all' },
  { key: 'n', shift: true, alt: false, reason: 'Incognito/Private window', platform: 'all' },
  { key: 'p', shift: true, alt: false, reason: 'Incognito window (Firefox)', platform: 'all' },
  { key: 'j', shift: true, alt: false, reason: 'Downloads (Firefox)', platform: 'all' },
  { key: 'g', shift: true, alt: false, reason: 'Find previous', platform: 'all' },
  { key: 'i', shift: true, alt: false, reason: 'Developer tools', platform: 'all' },
  { key: 'c', shift: true, alt: false, reason: 'Developer tools (Elements)', platform: 'all' },
  { key: 'b', shift: true, alt: false, reason: 'Toggle bookmarks bar', platform: 'all' },
  { key: 'o', shift: true, alt: false, reason: 'Bookmark manager', platform: 'all' },
  { key: 'delete', shift: true, alt: false, reason: 'Clear browsing data', platform: 'all' },

  // Mac-specific shift combinations
  { key: 'm', shift: true, alt: false, reason: 'Toggle user switching', platform: 'mac' },

  // Alt/Option combinations (primarily Mac)
  { key: 'd', shift: false, alt: true, reason: 'Focus address bar', platform: 'mac' },
  { key: 'i', shift: true, alt: true, reason: 'Developer tools', platform: 'all' },
  { key: 'j', shift: true, alt: true, reason: 'JavaScript console', platform: 'all' },
  { key: 'c', shift: true, alt: true, reason: 'Developer tools', platform: 'all' },
];

export function getReservedConflict(config: KeybindConfig): string | null {
  const hasMainModifier = config.ctrl || config.meta;
  if (!hasMainModifier) return null;

  const currentPlatform: Platform = isMac() ? 'mac' : 'windows';

  const match = RESERVED_SHORTCUTS.find(
    (shortcut) =>
      shortcut.key.toLowerCase() === config.key.toLowerCase() &&
      shortcut.shift === config.shift &&
      shortcut.alt === config.alt &&
      (shortcut.platform === 'all' || shortcut.platform === currentPlatform)
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
