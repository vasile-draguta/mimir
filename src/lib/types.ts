export interface HistoryEntry {
  id: string;
  selectedText: string;
  contextResponse: string;
  timestamp: number;
  sourceUrl: string;
  model: string;
}

export interface HistoryStorage {
  entries: HistoryEntry[];
}

export interface KeybindConfig {
  key: string; // lowercase, e.g., 'k'
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}
