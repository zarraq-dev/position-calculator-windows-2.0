/**
 * InputField Component
 * Reusable input field with label for the calculator
 */

import React from 'react';

/**
 * Props interface for InputField component
 */
interface InputFieldProps
{
    s_label: string; // Label text for the input field
    s_value: string; // Current value of the input
    s_id: string; // HTML id attribute for the input
    onChange: (s_value: string) => void; // Callback when value changes
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void; // Callback for key press events
}

/**
 * InputField component - renders a labeled input field
 */
export default function InputField({ s_label, s_value, s_id, onChange, onKeyDown }: InputFieldProps): React.ReactElement
{
    return (
        <div className="input-group">
            <label htmlFor={s_id}>{s_label}:</label>
            <input
                type="text"
                id={s_id}
                value={s_value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
            />
        </div>
    );
}
