/**
 * React Entry Point
 * Renders the main App component into the DOM
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Get the root element from the DOM
const element_root: HTMLElement | null = document.getElementById('root'); // Root DOM element

if (element_root)
{
    const root = createRoot(element_root);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
