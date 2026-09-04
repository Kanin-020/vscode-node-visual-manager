import '../styles/global.css';
import '../styles/codicon.css';

import React, { useEffect } from 'react';

import { createRoot } from 'react-dom/client';

import CurrentVersionsBar from '../components/CurrentVersionsBar/CurrentVersionsBar';

const CurrentApp: React.FC = () => {
    useEffect(() => {
        document.body.style.opacity = '1';
    }, []);
    return <CurrentVersionsBar />;
};

const currentContainer = document.getElementById('current-root');
const currentRoot = createRoot(currentContainer!);
currentRoot.render(<CurrentApp />);
