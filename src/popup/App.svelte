<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { KeybindConfig } from '../lib/types';
  import {
    DEFAULT_KEYBIND,
    formatKeybind,
    getReservedConflict,
    isModifierOnly,
    keybindFromEvent,
  } from '../lib/keybind';

  const MODELS = [
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      category: 'fast',
    },
    { id: 'groq/compound-mini', name: 'Compound Mini', category: 'fast' },
    { id: 'groq/compound', name: 'Compound', category: 'balanced' },
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', category: 'balanced' },
    {
      id: 'meta-llama/llama-4-scout-17b-16e-instruct',
      name: 'Llama 4 Scout',
      category: 'balanced',
    },
    {
      id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      name: 'Llama 4 Maverick',
      category: 'balanced',
    },
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B',
      category: 'powerful',
    },
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', category: 'powerful' },
  ] as const;

  const DEFAULT_MODEL = 'llama-3.1-8b-instant';

  const logoUrl = chrome.runtime.getURL('public/logo.png');

  let enabled = $state(true);
  let selectedModel = $state(DEFAULT_MODEL);
  let keybind = $state<KeybindConfig>(DEFAULT_KEYBIND);
  let isRecording = $state(false);
  let keybindError = $state<string | null>(null);
  let keybindButtonRef = $state<HTMLButtonElement | null>(null);

  onMount(async () => {
    const storage = await chrome.storage.local.get({
      enabled: true,
      model: DEFAULT_MODEL,
      keybind: DEFAULT_KEYBIND,
    });
    enabled = storage.enabled as boolean;
    selectedModel = storage.model as string;
    keybind = storage.keybind as KeybindConfig;
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

  function startRecording() {
    isRecording = true;
    keybindError = null;
    document.addEventListener('keydown', handleRecordKeydown);
    document.addEventListener('click', handleClickOutside);
  }

  function stopRecording() {
    isRecording = false;
    document.removeEventListener('keydown', handleRecordKeydown);
    document.removeEventListener('click', handleClickOutside);
  }

  function handleRecordKeydown(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      stopRecording();
      keybindError = null;
      return;
    }

    if (isModifierOnly(event)) {
      return;
    }

    const newKeybind = keybindFromEvent(event);
    const conflict = getReservedConflict(newKeybind);

    if (conflict) {
      keybindError = conflict;
      return;
    }

    keybind = newKeybind;
    keybindError = null;
    chrome.storage.local.set({ keybind: newKeybind });
    stopRecording();
  }

  function handleClickOutside(event: MouseEvent) {
    if (keybindButtonRef && !keybindButtonRef.contains(event.target as Node)) {
      stopRecording();
    }
  }

  function resetKeybind() {
    keybind = DEFAULT_KEYBIND;
    keybindError = null;
    chrome.storage.local.set({ keybind: DEFAULT_KEYBIND });
  }

  onDestroy(() => {
    document.removeEventListener('keydown', handleRecordKeydown);
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="flex flex-col gap-4 p-5 min-w-[320px]">
  <header class="border-b border-gray-200 dark:border-gray-700 pb-4">
    <div class="flex items-center justify-center gap-3">
      <img
        src={logoUrl}
        alt="Mimir logo"
        class="w-8 h-8 rounded-md object-contain shrink-0"
      />
      <h1 class="text-xl font-semibold m-0">Mimir</h1>
    </div>
  </header>

  <div class="flex items-center justify-between gap-4">
    <label class="flex flex-col gap-0.5" for="enabled-toggle">
      <span class="font-medium text-sm">Extension Enabled</span>
      <span class="text-xs text-gray-500 dark:text-gray-400"
        >Enable or disable</span
      >
    </label>
    <button
      id="enabled-toggle"
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full cursor-pointer transition-colors duration-200 ease border-0 p-0 {enabled
        ? 'bg-blue-500'
        : 'bg-gray-300 dark:bg-gray-600'}"
      onclick={handleToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Disable extension' : 'Enable extension'}
    >
      <span
        class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease {enabled
          ? 'translate-x-[22px]'
          : 'translate-x-[2px]'}"
      ></span>
    </button>
  </div>

  <div class="flex flex-col gap-2">
    <label class="flex flex-col gap-0.5" for="model-select">
      <span class="font-medium text-sm">Model</span>
      <span class="text-xs text-gray-500 dark:text-gray-400"
        >Select the AI model</span
      >
    </label>
    <select
      id="model-select"
      class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={selectedModel}
      onchange={handleModelChange}
    >
      <optgroup label="⚡ Fast">
        {#each MODELS.filter((m) => m.category === 'fast') as model}
          <option value={model.id}>{model.name}</option>
        {/each}
      </optgroup>
      <optgroup label="⚖️ Balanced">
        {#each MODELS.filter((m) => m.category === 'balanced') as model}
          <option value={model.id}>{model.name}</option>
        {/each}
      </optgroup>
      <optgroup label="🧠 Powerful">
        {#each MODELS.filter((m) => m.category === 'powerful') as model}
          <option value={model.id}>{model.name}</option>
        {/each}
      </optgroup>
    </select>
  </div>

  <div class="flex flex-col gap-2">
    <label class="flex flex-col gap-0.5" for="keybind-button">
      <span class="font-medium text-sm">Shortcut</span>
      {#if keybindError}
        <span class="text-xs text-red-500 dark:text-red-400"
          >{keybindError}</span
        >
      {:else}
        <span class="text-xs text-gray-500 dark:text-gray-400"
          >Trigger the popover</span
        >
      {/if}
    </label>
    <div class="flex items-center gap-2">
      <button
        bind:this={keybindButtonRef}
        id="keybind-button"
        class="flex-1 px-3 py-2 text-sm font-mono rounded-md border cursor-pointer text-center transition-colors duration-200 ease {isRecording
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a]'}"
        onclick={startRecording}
        aria-label={isRecording
          ? 'Press keys to set shortcut'
          : 'Change shortcut'}
      >
        {isRecording ? 'Press keys...' : formatKeybind(keybind)}
      </button>
      <button
        class="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease"
        onclick={resetKeybind}
        aria-label="Reset to default shortcut"
        title="Reset to default"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
  </div>
</div>
