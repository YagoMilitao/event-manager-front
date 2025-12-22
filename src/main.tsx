import React from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import App from './App.tsx'
import "leaflet/dist/leaflet.css";
import './firebase'


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
