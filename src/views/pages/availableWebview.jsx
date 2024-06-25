import '../../styles/global.css';
import '../../styles/codicon.css';

import AvailableBar from '../components/AvailableBar/AvailableBar';
import React from 'react';
import { createRoot } from 'react-dom/client';

const AvailableApp = () => (
  <div>
    <AvailableBar/>
  </div>
);

const availableContainer = document.getElementById('available-root');
const availableRoot = createRoot(availableContainer);
availableRoot.render(<AvailableApp />); 