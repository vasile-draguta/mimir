import { mount } from 'svelte';
import App from './views/App.svelte';
import './style.css';

function mountApp() {
  if (!document.body || document.getElementById('mimir-app')) return;

  const container = document.createElement('div');
  container.id = 'mimir-app';
  container.className = 'mimir-extension';

  container.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 0; height: 0;
    pointer-events: none;
    z-index: 2147483647;
    overflow: visible;
  `;

  document.body.appendChild(container);
  mount(App, { target: container });
}

mountApp();

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    document.getElementById('mimir-app')?.remove();
  });
}
