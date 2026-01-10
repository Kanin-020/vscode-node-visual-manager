import '../../styles/global.css';
import '../../styles/codicon.css';

import React, { Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const CurrentVersionsBar = React.lazy(() => import('../components/CurrentVersionsBar/CurrentVersionsBar'));

const CurrentApp = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CurrentVersionsBar />
  </Suspense>
);

const currentContainer = document.getElementById('current-root');
const currentRoot = createRoot(currentContainer);
currentRoot.render(<CurrentApp />); 