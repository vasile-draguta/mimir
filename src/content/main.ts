import { mount } from 'svelte';
import App from './views/App.svelte';
import styleContent from './style.css?inline';

const svgFilter = `
<svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; width: 0; height: 0; overflow: hidden;">
  <defs>
    <filter id="mimir-glass-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
      <feComposite in="SourceGraphic" in2="glow" operator="atop" />
    </filter>
  </defs>
</svg>
`;

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

  const svgContainer = document.createElement('div');
  svgContainer.style.cssText =
    'position: absolute; width: 0; height: 0; pointer-events: none;';
  svgContainer.innerHTML = svgFilter;
  shadowRoot.appendChild(svgContainer);

  shadowRoot.appendChild(shadowContainer);

  mount(App, { target: shadowContainer });
}

mountApp();

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    document.getElementById('mimir-app')?.remove();
  });
}
