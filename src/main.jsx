import React from 'react';
import ReactDOM from 'react-dom/client';
import 'webrtc-adapter';
import App from './App.jsx';
import './index.css';
import { HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);