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
