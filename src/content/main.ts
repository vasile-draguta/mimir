import { mount } from 'svelte';
import App from './views/App.svelte';
import styleContent from './style.css?inline';

function mountApp() {
  if (!document.body || document.getElementById('mimir-app')) return;

  const container = document.createElement('div');
  container.id = 'mimir-app';

  container.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 0; height: 0;
    pointer-events: none;
    z-index: 2147483647;
    overflow: visible;
  `;

  document.body.appendChild(container);

  const shadowRoot = container.attachShadow({ mode: 'open' });

  const shadowContainer = document.createElement('div');
  shadowContainer.className = 'mimir-extension';
  shadowContainer.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  `;

  const style = document.createElement('style');
  style.textContent = styleContent;
  shadowRoot.appendChild(style);

  shadowRoot.appendChild(shadowContainer);

  mount(App, { target: shadowContainer });
}

mountApp();

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    document.getElementById('mimir-app')?.remove();
  });
}
