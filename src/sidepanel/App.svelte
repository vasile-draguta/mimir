<script lang="ts">
  import { onMount } from 'svelte';
  import type { HistoryEntry, HistoryStorage } from '../lib/types';
  import { getEntries, deleteEntry, clearAll } from '../lib/historyStorage';
  import SearchBar from './components/SearchBar.svelte';
  import HistoryList from './components/HistoryList.svelte';
  import EmptyState from './components/EmptyState.svelte';

  const STORAGE_KEY = 'searchHistory';
  const HOLD_DURATION = 1000;

  let entries = $state<HistoryEntry[]>([]);
  let searchQuery = $state('');
  let isLoading = $state(true);
  let holdProgress = $state(0);
  let animationFrame = $state<number | null>(null);
  let holdStartTime = $state<number | null>(null);
  let isHolding = $state(false);

  let filteredEntries = $derived(
    searchQuery
      ? entries.filter((entry) =>
          entry.selectedText.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : entries
  );

  async function loadEntries() {
    try {
      entries = await getEntries();
    } catch (error) {
      console.error('[Mimir] Failed to load history:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEntry(id);
      entries = entries.filter((e) => e.id !== id);
    } catch (error) {
      console.error('[Mimir] Failed to delete entry:', error);
    }
  }

  async function handleClearAll() {
    try {
      await clearAll();
      entries = [];
    } catch (error) {
      console.error('[Mimir] Failed to clear history:', error);
    }
  }

  function handleSearchInput(value: string) {
    searchQuery = value;
  }

  function updateProgress() {
    if (holdStartTime === null || !isHolding) return;

    const elapsed = Date.now() - holdStartTime;
    holdProgress = Math.min(elapsed / HOLD_DURATION, 1);

    if (holdProgress >= 1) {
      handleClearAll();
      resetHold();
    } else {
      animationFrame = requestAnimationFrame(updateProgress);
    }
  }

  function startHold() {
    isHolding = true;
    holdStartTime = Date.now();
    holdProgress = 0;
    animationFrame = requestAnimationFrame(updateProgress);
  }

  function resetHold() {
    isHolding = false;
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    holdStartTime = null;
    holdProgress = 0;
  }

  onMount(() => {
    loadEntries();

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEY]) {
        const newValue = changes[STORAGE_KEY].newValue as
          | HistoryStorage
          | undefined;
        entries = newValue?.entries || [];
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      resetHold();
    };
  });
</script>

<div class="sidepanel-container">
  <header class="header">
    <h1 class="header-title">Recent Searches</h1>
    {#if entries.length > 0}
      <div class="clear-btn-container">
        <button
          class="btn btn-clear"
          onmousedown={startHold}
          onmouseup={resetHold}
          onmouseleave={resetHold}
          ontouchstart={startHold}
          ontouchend={resetHold}
          ontouchcancel={resetHold}
        >
          Clear All
        </button>
        <div
          class="btn btn-clear-confirm"
          style="clip-path: inset(0 {100 -
            holdProgress * 100}% 0 0); transition: {isHolding
            ? 'none'
            : 'clip-path 0.2s ease-out'};"
          aria-hidden="true"
        >
          Clear All
        </div>
      </div>
    {/if}
  </header>

  {#if entries.length > 0}
    <SearchBar value={searchQuery} onInput={handleSearchInput} />
  {/if}

  <main class="main-content">
    {#if isLoading}
      <div class="loading-state">Loading...</div>
    {:else if entries.length === 0}
      <EmptyState />
    {:else if filteredEntries.length === 0}
      <EmptyState isSearchResult={true} />
    {:else}
      <HistoryList entries={filteredEntries} onDelete={handleDelete} />
    {/if}
  </main>
</div>
