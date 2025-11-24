import { App } from './js/App.js';

// Destructure React globals from the UMD build
const { createElement: h } = React;
const { createRoot } = ReactDOM;

// Initialize App
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(h(App));
}
