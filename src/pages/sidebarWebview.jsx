import '../components/sidebarComponent/sidebar.css';
import '../styles/global.css';
import '../styles/codicon.css';

import React from 'react';
import SidebarComponent from '../components/sidebarComponent/sidebarComponent';
import { createRoot } from 'react-dom/client';

const SidebarApp = () => (
  <div>
    <SidebarComponent />
  </div>
);

const sidebarContainer = document.getElementById('sidebar-root');
const sidebarRoot = createRoot(sidebarContainer);
sidebarRoot.render(<SidebarApp />); 