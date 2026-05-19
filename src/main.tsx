import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { initTheme } from './shared/theme/theme';
import './shared/styles/tokens.css';
import './shared/styles/globals.css';

initTheme();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
