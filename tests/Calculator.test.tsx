/**
 * Test suite for Calculator UI component
 * Following pragmatic TDD approach - tests written to verify behavior
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from '../src/renderer/components/Calculator';

describe('Calculator Component - Rendering', () =>
{
    it('Test 1: Calculator renders all input fields', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // ASSERT: Check that all input fields are present
        expect(screen.getByLabelText(/entry price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/target price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/stop loss/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/risk amount/i)).toBeInTheDocument();
    });

    it('Test 2: Calculator renders direction dropdown', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // ASSERT: Check that direction dropdown is present
        expect(screen.getByLabelText(/direction/i)).toBeInTheDocument();
    });

    it('Test 3: Calculator renders calculate button', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // ASSERT: Check that calculate button is present
        expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
    });

    it('Test 4: Calculator renders clear button', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // ASSERT: Check that clear button is present
        expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
});

describe('Calculator Component - User Input', () =>
{
    it('Test 5: User can type in entry price field', () =>
    {
        // ARRANGE: Render the Calculator component
        render(<Calculator />);
        const s_element_entryPriceInput = screen.getByLabelText(/entry price/i) as HTMLInputElement; // Entry price input element

        // ACT: Type in the input field
        fireEvent.change(s_element_entryPriceInput, { target: { value: '100' } });

        // ASSERT: Check that value was updated
        expect(s_element_entryPriceInput.value).toBe('100');
    });

    it('Test 6: User can change direction dropdown', () =>
    {
        // ARRANGE: Render the Calculator component
        render(<Calculator />);
        const s_element_directionDropdown = screen.getByLabelText(/direction/i) as HTMLSelectElement; // Direction dropdown element

        // ACT: Change dropdown value
        fireEvent.change(s_element_directionDropdown, { target: { value: 'Short' } });

        // ASSERT: Check that value was updated
        expect(s_element_directionDropdown.value).toBe('Short');
    });
});

describe('Calculator Component - Calculation', () =>
{
    it('Test 7: Calculate button triggers calculation and shows results', () =>
    {
        // ARRANGE: Render and fill in valid trade data
        render(<Calculator />);
        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '110' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '95' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '500' } });
        fireEvent.change(screen.getByLabelText(/direction/i), { target: { value: 'Long' } });

        // ACT: Click calculate button
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Check that results are displayed
        expect(screen.getByText(/position size:/i)).toBeInTheDocument();
        expect(screen.getByText(/100/)).toBeInTheDocument(); // Position size should be 100
        expect(screen.getByText(/reward.*risk/i)).toBeInTheDocument();
        expect(screen.getByText(/2:1|2.0:1/)).toBeInTheDocument(); // Reward:risk should be 2:1
    });

    it('Test 8: Error modal displays for invalid inputs', () =>
    {
        // ARRANGE: Render and fill in invalid trade data (stop above entry for long)
        render(<Calculator />);
        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '110' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '105' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '500' } });
        fireEvent.change(screen.getByLabelText(/direction/i), { target: { value: 'Long' } });

        // ACT: Click calculate button
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Check that error modal backdrop is displayed
        expect(screen.getByText(/stop loss must be below entry price for long positions/i)).toBeInTheDocument();
        expect(document.querySelector('.modal-close-button')).toBeInTheDocument();
    });
});

describe('Calculator Component - Clear Functionality', () =>
{
    it('Test 9: Clear button resets all inputs', () =>
    {
        // ARRANGE: Render and fill in data
        render(<Calculator />);
        const s_element_entryPriceInput = screen.getByLabelText(/entry price/i) as HTMLInputElement; // Entry price input element
        const s_element_targetPriceInput = screen.getByLabelText(/target price/i) as HTMLInputElement; // Target price input element

        fireEvent.change(s_element_entryPriceInput, { target: { value: '100' } });
        fireEvent.change(s_element_targetPriceInput, { target: { value: '110' } });

        // ACT: Click clear button
        fireEvent.click(screen.getByRole('button', { name: /clear/i }));

        // ASSERT: Check that all inputs are cleared
        expect(s_element_entryPriceInput.value).toBe('');
        expect(s_element_targetPriceInput.value).toBe('');
    });

    it('Test 10: Clear button removes results display', () =>
    {
        // ARRANGE: Render, calculate, then clear
        render(<Calculator />);
        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '110' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '95' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '500' } });
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ACT: Click clear button
        fireEvent.click(screen.getByRole('button', { name: /clear/i }));

        // ASSERT: Check that results are no longer displayed
        expect(screen.queryByText(/100/)).not.toBeInTheDocument();
    });
});

describe('Calculator Component - Validation', () =>
{
    it('Test 11: Error modal displays when fields are empty', () =>
    {
        // ARRANGE: Render the Calculator component (all fields empty)
        render(<Calculator />);

        // ACT: Click calculate button without filling any fields
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Check that error modal is displayed
        expect(screen.getByText(/please enter valid numbers for all fields/i)).toBeInTheDocument();
        expect(document.querySelector('.modal-close-button')).toBeInTheDocument();
    });

    it('Test 12: Enter key triggers calculation', () =>
    {
        // ARRANGE: Render and fill in valid trade data
        render(<Calculator />);
        const s_element_entryPriceInput = screen.getByLabelText(/entry price/i) as HTMLInputElement; // Entry price input element

        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '110' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '95' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '500' } });

        // ACT: Press Enter key on any input field
        fireEvent.keyDown(s_element_entryPriceInput, { key: 'Enter', code: 'Enter' });

        // ASSERT: Check that results are displayed
        expect(screen.getByText(/100/)).toBeInTheDocument(); // Position size should be 100
    });
});

describe('Calculator Component - Results Display', () =>
{
    it('Test 13: Results section is always visible from start', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // ASSERT: Check that results section is visible even without calculation
        expect(screen.getByText(/position size:/i)).toBeInTheDocument();
        expect(screen.getByText(/reward.*risk/i)).toBeInTheDocument();

        // Check for placeholder values
        const array_s_placeholderElements = screen.getAllByText(/^--$|^--:1$/); // Array of placeholder text elements
        expect(array_s_placeholderElements.length).toBeGreaterThan(0); // At least one placeholder should be visible
    });
});

describe('Calculator Component - Error Modal Functionality', () =>
{
    it('Test 14: Modal displays correct error message content', () =>
    {
        // ARRANGE: Render and trigger error
        render(<Calculator />);
        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '90' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '95' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '500' } });
        fireEvent.change(screen.getByLabelText(/direction/i), { target: { value: 'Long' } });

        // ACT: Click calculate button
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Check that specific error message is displayed in modal
        expect(screen.getByText(/target price must be above entry price for long positions/i)).toBeInTheDocument();
    });

    it('Test 15: Close button closes error modal', () =>
    {
        // ARRANGE: Render and trigger error modal
        render(<Calculator />);
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // Verify modal is visible
        expect(screen.getByText(/please enter valid numbers for all fields/i)).toBeInTheDocument();

        // ACT: Click modal close button
        const modalCloseButton_element = document.querySelector('.modal-close-button') as HTMLButtonElement; // Modal close button element
        fireEvent.click(modalCloseButton_element);

        // ASSERT: Check that modal is no longer displayed
        expect(screen.queryByText(/please enter valid numbers for all fields/i)).not.toBeInTheDocument();
        expect(document.querySelector('.modal-close-button')).not.toBeInTheDocument();
    });

    it('Test 16: ESC key closes error modal', () =>
    {
        // ARRANGE: Render and trigger error modal
        render(<Calculator />);
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // Verify modal is visible
        expect(screen.getByText(/please enter valid numbers for all fields/i)).toBeInTheDocument();

        // ACT: Press ESC key
        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

        // ASSERT: Check that modal is no longer displayed
        expect(screen.queryByText(/please enter valid numbers for all fields/i)).not.toBeInTheDocument();
        expect(document.querySelector('.modal-close-button')).not.toBeInTheDocument();
    });

    it('Test 17: Enter key closes error modal', () =>
    {
        // ARRANGE: Render and trigger error modal
        const { container } = render(<Calculator />);
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // Verify modal is visible
        expect(screen.getByText(/please enter valid numbers for all fields/i)).toBeInTheDocument();

        // ACT: Press Enter key on calculator div (context-aware handler)
        const s_element_calculatorDiv = container.querySelector('.calculator'); // Calculator container element
        fireEvent.keyDown(s_element_calculatorDiv!, { key: 'Enter', code: 'Enter' });

        // ASSERT: Check that modal is no longer displayed
        expect(screen.queryByText(/please enter valid numbers for all fields/i)).not.toBeInTheDocument();
        expect(document.querySelector('.modal-close-button')).not.toBeInTheDocument();
    });
});
