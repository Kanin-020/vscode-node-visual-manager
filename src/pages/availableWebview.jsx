import '../styles/global.css';
import '../styles/codicon.css';

import Available from '../components/Available/Available';
import React from 'react';
import { createRoot } from 'react-dom/client';

const AvailableApp = () => (
  <div>
    <Available/>
  </div>
);

const availableContainer = document.getElementById('available-root');
const availableRoot = createRoot(availableContainer);
availableRoot.render(<AvailableApp />); 