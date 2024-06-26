import '../../styles/global.css';
import '../../styles/codicon.css';

import React, { Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const AvailableBar = React.lazy(() => import('../components/AvailableBar/AvailableBar.jsx'));

const AvailableApp = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AvailableBar />
  </Suspense>
);

const availableContainer = document.getElementById('available-root');
const availableRoot = createRoot(availableContainer);
availableRoot.render(<AvailableApp />);
