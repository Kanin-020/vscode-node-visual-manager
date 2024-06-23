import '../components/availableComponent/available.css';
import '../styles/global.css';
import '../styles/codicon.css';

import AvailableComponent from '../components/availableComponent/availableComponent';
import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (
  <div>
    <AvailableComponent />
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />); 