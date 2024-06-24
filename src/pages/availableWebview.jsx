import '../components/availableComponent/available.css';
import '../styles/global.css';
import '../styles/codicon.css';

import AvailableComponent from '../components/availableComponent/availableComponent';
import React from 'react';
import { createRoot } from 'react-dom/client';

const AvailableApp = () => (
  <div>
    <AvailableComponent />
  </div>
);

const availableContainer = document.getElementById('available-root');
const availableRoot = createRoot(availableContainer);
availableRoot.render(<AvailableApp />); 