import '../styles/global.css';
import '../styles/codicon.css';

import React from 'react';
import SideBar from '../components/Sidebar/Sidebar';
import { createRoot } from 'react-dom/client';

const SidebarApp = () => (
  <div>
    <Sidebar/>
  </div>
);

const sidebarContainer = document.getElementById('sidebar-root');
const sidebarRoot = createRoot(sidebarContainer);
sidebarRoot.render(<SidebarApp />); 