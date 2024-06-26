import '../../styles/global.css';
import '../../styles/codicon.css';

import React, { Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const SideBar = React.lazy(() => import('../components/SideBar/SideBar.jsx'));

const SidebarApp = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SideBar />
  </Suspense>
);

const sidebarContainer = document.getElementById('sidebar-root');
const sidebarRoot = createRoot(sidebarContainer);
sidebarRoot.render(<SidebarApp />); 