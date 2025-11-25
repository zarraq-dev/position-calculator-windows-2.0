/**
 * Main Application Component
 * Wraps the Calculator component
 */

import React from 'react';
import Calculator from './components/Calculator';

/**
 * App component - main entry point for the React application
 */
export default function App(): React.ReactElement
{
    return (
        <div className="app">
            <Calculator />
        </div>
    );
}
