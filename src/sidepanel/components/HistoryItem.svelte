<script lang="ts">
  import type { HistoryEntry } from '../../lib/types';

  interface Props {
    entry: HistoryEntry;
    onDelete: (id: string) => void;
  }

  let { entry, onDelete }: Props = $props();
  let isExpanded = $state(false);

  const MAX_URL_LENGTH = 40;

  function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return formatDate(timestamp);
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  function handleDelete(event: MouseEvent) {
    event.stopPropagation();
    onDelete(entry.id);
  }

  function toggleExpand(event: MouseEvent) {
    event.stopPropagation();
    isExpanded = !isExpanded;
  }
</script>

<div class="history-item {isExpanded ? 'expanded' : ''}">
  <button
    class="history-item-delete"
    onclick={handleDelete}
    aria-label="Delete entry"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 6h18"></path>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg>
  </button>

  <div class="history-item-content">
    <span class="history-item-text {isExpanded ? '' : 'truncated'}"
      >{entry.selectedText}</span
    >
    <div class="history-item-footer">
      <span class="history-item-time"
        >{formatRelativeTime(entry.timestamp)}</span
      >
      <button
        class="history-item-toggle"
        onclick={toggleExpand}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="toggle-icon {isExpanded ? 'rotated' : ''}"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </button>
    </div>
  </div>

  <div class="history-item-details-wrapper">
    <div class="history-item-details">
      <div class="history-item-response">
        <p>{entry.contextResponse}</p>
      </div>
      <div class="history-item-meta">
        <div class="history-item-meta-row">
          <span class="history-item-meta-label">Source:</span>
          <a
            href={entry.sourceUrl}
            class="history-item-meta-link"
            target="_blank"
            rel="noopener noreferrer"
            onclick={(e) => e.stopPropagation()}
            title="Click to open"
          >
            {truncate(entry.sourceUrl, MAX_URL_LENGTH)}
          </a>
        </div>
        <div class="history-item-meta-row">
          <span class="history-item-meta-label">Model:</span>
          <span class="history-item-meta-value">{entry.model}</span>
        </div>
        <div class="history-item-meta-row">
          <span class="history-item-meta-label">Time:</span>
          <span class="history-item-meta-value"
            >{formatDate(entry.timestamp)}</span
          >
        </div>
      </div>
    </div>
  </div>
</div>
