import '../styles/global.css';
import '../styles/codicon.css';

import React, { useEffect } from 'react';

import { createRoot } from 'react-dom/client';

import AvailableVersionsBar from '../components/AvailableVersionsBar/AvailableVersionsBar';

const AvailableApp: React.FC = () => {
    useEffect(() => {
        document.body.style.opacity = '1';
    }, []);
    return <AvailableVersionsBar />;
};

const availableContainer = document.getElementById('available-root');
const availableRoot = createRoot(availableContainer!);
availableRoot.render(<AvailableApp />);
