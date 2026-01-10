import '../styles/global.css';
import '../styles/codicon.css';

import React, { Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const AvailableVersionsBar = React.lazy(() => import('../components/AvailableVersionsBar/AvailableVersionsBar'));

const AvailableApp = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AvailableVersionsBar />
  </Suspense>
);

const availableContainer = document.getElementById('available-root');
const availableRoot = createRoot(availableContainer);
availableRoot.render(<AvailableApp />);
