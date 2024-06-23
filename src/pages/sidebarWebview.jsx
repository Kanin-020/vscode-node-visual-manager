import '../components/sidebarComponent/sidebar.css';
import '../styles/global.css';
import '../styles/codicon.css';

import React from 'react';
import SidebarComponent from '../components/sidebarComponent/sidebarComponent';
import { createRoot } from 'react-dom/client';

const App = () => (
  <div>
    <SidebarComponent />
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />); 