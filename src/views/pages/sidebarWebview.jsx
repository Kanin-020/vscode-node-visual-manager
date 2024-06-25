import '../../styles/global.css';
import '../../styles/codicon.css';

import React from 'react';
import SideBar from '../components/SideBar/SideBar';
import { createRoot } from 'react-dom/client';

const SidebarApp = () => (
  <div>
    <SideBar/>
  </div>
);

const sidebarContainer = document.getElementById('sidebar-root');
const sidebarRoot = createRoot(sidebarContainer);
sidebarRoot.render(<SidebarApp />); 