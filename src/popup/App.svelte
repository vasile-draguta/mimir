<script lang="ts">
  import { onMount } from 'svelte';

  const MODELS = [
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout' },
    { id: 'gpt-oss-20b', name: 'GPT OSS 20B' },
    { id: 'gpt-oss-120b', name: 'GPT OSS 120B' },
    { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2' },
  ] as const;

  const DEFAULT_MODEL = 'llama-3.1-8b-instant';

  let enabled = $state(true);
  let selectedModel = $state(DEFAULT_MODEL);
  let isLoaded = $state(false);

  onMount(async () => {
    const storage = await chrome.storage.local.get({
      enabled: true,
      model: DEFAULT_MODEL,
    });
    enabled = storage.enabled as boolean;
    selectedModel = storage.model as string;
    isLoaded = true;
  });

  function handleToggle() {
    enabled = !enabled;
    chrome.storage.local.set({ enabled });
  }

  async function handleModelChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedModel = target.value;
    await chrome.storage.local.set({ model: selectedModel });
  }
</script>

<div class="flex flex-col gap-4 p-4 min-w-[320px]">
  <header class="border-b border-gray-200 dark:border-gray-700 pb-3 mb-2">
    <h1 class="text-xl font-semibold m-0">Mimir</h1>
  </header>

  <div class="flex items-center justify-between gap-4 py-2">
    <label class="flex flex-col gap-0.5" for="enabled-toggle">
      <span class="font-medium text-sm">Extension Enabled</span>
      <span class="text-xs text-gray-500 dark:text-gray-400">Enable or disable the extension</span>
    </label>
    <button
      id="enabled-toggle"
      class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out border-0 p-0 {enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}"
      onclick={handleToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Disable extension' : 'Enable extension'}
    >
      <span 
        class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out {enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}"
      ></span>
    </button>
  </div>

  <div class="flex items-center justify-between gap-4 py-2">
    <label class="flex flex-col gap-0.5" for="model-select">
      <span class="font-medium text-sm">Model</span>
      <span class="text-xs text-gray-500 dark:text-gray-400">Select the AI model to use</span>
    </label>
    <select
      id="model-select"
      class="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] cursor-pointer min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={selectedModel}
      onchange={handleModelChange}
    >
      {#each MODELS as model}
        <option value={model.id}>{model.name}</option>
      {/each}
    </select>
  </div>
</div>
