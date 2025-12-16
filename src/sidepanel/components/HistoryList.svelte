<script lang="ts">
  import type { HistoryEntry } from '../../lib/types';
  import HistoryItem from './HistoryItem.svelte';

  interface Props {
    entries: HistoryEntry[];
    onDelete: (id: string) => void;
  }

  let { entries, onDelete }: Props = $props();

  interface GroupedEntries {
    label: string;
    entries: HistoryEntry[];
  }

  function getDateLabel(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  function groupByDay(entries: HistoryEntry[]): GroupedEntries[] {
    const groups = new Map<string, HistoryEntry[]>();

    for (const entry of entries) {
      const label = getDateLabel(entry.timestamp);
      const existing = groups.get(label) || [];
      groups.set(label, [...existing, entry]);
    }

    return Array.from(groups.entries()).map(([label, entries]) => ({
      label,
      entries,
    }));
  }

  let groupedEntries = $derived(groupByDay(entries));
</script>

<div class="history-list">
  {#each groupedEntries as group}
    <div class="history-group">
      <h3 class="history-group-label">{group.label}</h3>
      <div class="history-items">
        {#each group.entries as entry (entry.id)}
          <HistoryItem {entry} {onDelete} />
        {/each}
      </div>
    </div>
  {/each}
</div>
