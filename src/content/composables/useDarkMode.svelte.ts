import { onMount } from 'svelte';

export function useDarkMode(getElement: () => HTMLElement | null) {
  let isDarkMode = $state(false);

  function detectDarkMode() {
    const htmlElement = document.documentElement;
    const hasDarkClass = htmlElement.classList.contains('dark');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    return hasDarkClass || prefersDark;
  }

  function updateDarkMode() {
    isDarkMode = detectDarkMode();
    const element = getElement();
    if (element) {
      if (isDarkMode) {
        element.classList.add('dark');
      } else {
        element.classList.remove('dark');
      }
    }
  }

  onMount(() => {
    updateDarkMode();
    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    const handleDarkModeChange = () => updateDarkMode();
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    };
  });

  $effect(() => {
    const element = getElement();
    if (element) {
      updateDarkMode();
    }
  });

  return {
    get isDarkMode() {
      return isDarkMode;
    },
    updateDarkMode,
  };
}
