<script lang="ts">
  interface Props {
    isSearchResult?: boolean;
  }

  let { isSearchResult = false }: Props = $props();
</script>

<div class="empty-state">
  <svg
    class="empty-state-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    {#if isSearchResult}
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
      <path d="M8 11h6"></path>
    {:else}
      <path d="M12 8v4l3 3"></path>
      <circle cx="12" cy="12" r="10"></circle>
    {/if}
  </svg>
  <p class="empty-state-title">
    {isSearchResult ? 'No matches found' : 'No recent searches'}
  </p>
  <p class="empty-state-description">
    {isSearchResult
      ? 'Try a different search term'
      : 'Your context searches will appear here'}
  </p>
</div>
