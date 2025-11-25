/**
 * ErrorModal Component
 * Displays error messages in a modal overlay
 */

import React, { useEffect } from 'react';

/**
 * Props interface for ErrorModal component
 */
interface ErrorModalProps
{
    s_message: string; // Error message to display
    b_isVisible: boolean; // Whether the modal is visible
    onClose: () => void; // Callback to close the modal
}

/**
 * ErrorModal component - displays error messages in a modal dialog
 */
export default function ErrorModal({ s_message, b_isVisible, onClose }: ErrorModalProps): React.ReactElement | null
{
    // Handle ESC key to close modal
    useEffect(() =>
    {
        const handleEscKey = (event: KeyboardEvent): void =>
        {
            if (event.key === 'Escape' && b_isVisible)
            {
                onClose();
            }
        };

        // Add event listener when modal is visible
        if (b_isVisible)
        {
            window.addEventListener('keydown', handleEscKey);
        }

        // Cleanup event listener on unmount or when visibility changes
        return () =>
        {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [b_isVisible, onClose]);

    // Don't render anything if modal is not visible
    if (!b_isVisible)
    {
        return null;
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <p className="modal-message">{s_message}</p>
                <button className="modal-close-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}
