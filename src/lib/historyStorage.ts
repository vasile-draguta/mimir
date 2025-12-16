import type { HistoryEntry, HistoryStorage } from './types';

const STORAGE_KEY = 'searchHistory';
const MAX_ENTRIES = 500;
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

function generateId(): string {
  return crypto.randomUUID();
}

function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > MAX_AGE_MS;
}

export async function getEntries(): Promise<HistoryEntry[]> {
  const storage = await chrome.storage.local.get({
    [STORAGE_KEY]: { entries: [] },
  });
  const data = storage[STORAGE_KEY] as HistoryStorage;
  return data.entries;
}

async function saveEntries(entries: HistoryEntry[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: { entries } });
}

export async function addEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): Promise<HistoryEntry> {
  const entries = await getEntries();

  const newEntry: HistoryEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  };

  let updatedEntries = [newEntry, ...entries];

  updatedEntries = updatedEntries.filter((e) => !isExpired(e.timestamp));

  if (updatedEntries.length > MAX_ENTRIES) {
    updatedEntries = updatedEntries.slice(0, MAX_ENTRIES);
  }

  await saveEntries(updatedEntries);
  return newEntry;
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getEntries();
  const updatedEntries = entries.filter((e) => e.id !== id);
  await saveEntries(updatedEntries);
}

export async function clearAll(): Promise<void> {
  await saveEntries([]);
}

export async function cleanupExpired(): Promise<number> {
  const entries = await getEntries();
  const validEntries = entries.filter((e) => !isExpired(e.timestamp));
  const removedCount = entries.length - validEntries.length;

  if (removedCount > 0) {
    await saveEntries(validEntries);
  }

  return removedCount;
}
