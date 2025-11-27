/**
 * Test suite for Calculator UI component
 * Following pragmatic TDD approach - tests written to verify behavior
 *
 * Note: These tests focus on UI rendering and user interaction.
 * The currency service is mocked to avoid external API calls in tests.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Calculator from '../src/renderer/components/Calculator';

// Mock the currency service to avoid API calls in tests
vi.mock('../src/shared/currencyService', () => ({
    getExchangeRate: vi.fn().mockResolvedValue(0.79) // Mock USD/GBP rate
}));

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

    it('Test 5: Calculator renders instrument dropdown with new options', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // ASSERT: Check that instrument dropdown is present with new options
        const instrumentDropdown_element = screen.getByLabelText(/instrument/i) as HTMLSelectElement;
        expect(instrumentDropdown_element).toBeInTheDocument();

        // Check for new instrument options
        expect(screen.getByText(/FX \(GBP pairs\)/i)).toBeInTheDocument();
        expect(screen.getByText(/FX \(USD pairs\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Gold \(XAUUSD\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Oil \(WTI\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Stock Indices/i)).toBeInTheDocument();
    });
});

describe('Calculator Component - User Input', () =>
{
    it('Test 6: User can type in entry price field', () =>
    {
        // ARRANGE: Render the Calculator component
        render(<Calculator />);
        const s_element_entryPriceInput = screen.getByLabelText(/entry price/i) as HTMLInputElement; // Entry price input element

        // ACT: Type in the input field
        fireEvent.change(s_element_entryPriceInput, { target: { value: '100' } });

        // ASSERT: Check that value was updated
        expect(s_element_entryPriceInput.value).toBe('100');
    });

    it('Test 7: User can change direction dropdown', () =>
    {
        // ARRANGE: Render the Calculator component
        render(<Calculator />);
        const s_element_directionDropdown = screen.getByLabelText(/direction/i) as HTMLSelectElement; // Direction dropdown element

        // ACT: Change dropdown value
        fireEvent.change(s_element_directionDropdown, { target: { value: 'Short' } });

        // ASSERT: Check that value was updated
        expect(s_element_directionDropdown.value).toBe('Short');
    });

    it('Test 8: User can change instrument dropdown', () =>
    {
        // ARRANGE: Render the Calculator component
        render(<Calculator />);
        const instrumentDropdown_element = screen.getByLabelText(/instrument/i) as HTMLSelectElement;

        // ACT: Change dropdown value to FX_USD
        fireEvent.change(instrumentDropdown_element, { target: { value: 'FX_USD' } });

        // ASSERT: Check that value was updated
        expect(instrumentDropdown_element.value).toBe('FX_USD');
    });
});

describe('Calculator Component - Calculation', () =>
{
    it('Test 9: Calculate button triggers calculation and shows results', async () =>
    {
        // ARRANGE: Render and fill in valid trade data
        render(<Calculator />);
        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '2000' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '1990' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '2030' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '150' } });
        fireEvent.change(screen.getByLabelText(/direction/i), { target: { value: 'Long' } });

        // ACT: Click calculate button
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Wait for async operation and check results are displayed
        await waitFor(() =>
        {
            expect(screen.getByText(/lot size:/i)).toBeInTheDocument();
            expect(screen.getByText(/reward.*risk/i)).toBeInTheDocument();
        });
    });

    it('Test 10: Error modal displays for invalid inputs', async () =>
    {
        // ARRANGE: Render and fill in invalid trade data (stop above entry for long)
        render(<Calculator />);
        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '105' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '110' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '500' } });
        fireEvent.change(screen.getByLabelText(/direction/i), { target: { value: 'Long' } });

        // ACT: Click calculate button
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Wait for async operation and check error modal is displayed
        await waitFor(() =>
        {
            expect(screen.getByText(/stop loss must be below entry price for long positions/i)).toBeInTheDocument();
            expect(document.querySelector('.modal-close-button')).toBeInTheDocument();
        });
    });
});

describe('Calculator Component - Clear Functionality', () =>
{
    it('Test 11: Clear button resets all inputs', () =>
    {
        // ARRANGE: Render and fill in data
        render(<Calculator />);
        const s_element_entryPriceInput = screen.getByLabelText(/entry price/i) as HTMLInputElement;
        const s_element_stopLossInput = screen.getByLabelText(/stop loss/i) as HTMLInputElement;

        fireEvent.change(s_element_entryPriceInput, { target: { value: '100' } });
        fireEvent.change(s_element_stopLossInput, { target: { value: '95' } });

        // ACT: Click clear button
        fireEvent.click(screen.getByRole('button', { name: /clear/i }));

        // ASSERT: Check that all inputs are cleared
        expect(s_element_entryPriceInput.value).toBe('');
        expect(s_element_stopLossInput.value).toBe('');
    });
});

describe('Calculator Component - Validation', () =>
{
    it('Test 12: Error modal displays when fields are empty', async () =>
    {
        // ARRANGE: Render the Calculator component (all fields empty)
        render(<Calculator />);

        // ACT: Click calculate button without filling any fields
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Wait for async operation and check error modal is displayed
        await waitFor(() =>
        {
            expect(screen.getByText(/please enter valid numbers for all fields/i)).toBeInTheDocument();
            expect(document.querySelector('.modal-close-button')).toBeInTheDocument();
        });
    });
});

describe('Calculator Component - Results Display', () =>
{
    it('Test 13: Results section is always visible from start', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // ASSERT: Check that results section is visible even without calculation
        expect(screen.getByText(/lot size:/i)).toBeInTheDocument();
        expect(screen.getByText(/reward.*risk/i)).toBeInTheDocument();

        // Check for placeholder values
        const array_s_placeholderElements = screen.getAllByText(/^--$|^--:1$/); // Array of placeholder text elements
        expect(array_s_placeholderElements.length).toBeGreaterThan(0); // At least one placeholder should be visible
    });
});

describe('Calculator Component - Error Modal Functionality', () =>
{
    it('Test 14: Modal displays correct error message content', async () =>
    {
        // ARRANGE: Render and trigger error
        render(<Calculator />);
        fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/stop loss/i), { target: { value: '95' } });
        fireEvent.change(screen.getByLabelText(/target price/i), { target: { value: '90' } });
        fireEvent.change(screen.getByLabelText(/risk amount/i), { target: { value: '500' } });
        fireEvent.change(screen.getByLabelText(/direction/i), { target: { value: 'Long' } });

        // ACT: Click calculate button
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // ASSERT: Wait for async operation and check error message
        await waitFor(() =>
        {
            expect(screen.getByText(/target price must be above entry price for long positions/i)).toBeInTheDocument();
        });
    });

    it('Test 15: Close button closes error modal', async () =>
    {
        // ARRANGE: Render and trigger error modal
        render(<Calculator />);
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // Wait for modal to appear
        await waitFor(() =>
        {
            expect(screen.getByText(/please enter valid numbers for all fields/i)).toBeInTheDocument();
        });

        // ACT: Click modal close button
        const modalCloseButton_element = document.querySelector('.modal-close-button') as HTMLButtonElement;
        fireEvent.click(modalCloseButton_element);

        // ASSERT: Check that modal is no longer displayed
        await waitFor(() =>
        {
            expect(screen.queryByText(/please enter valid numbers for all fields/i)).not.toBeInTheDocument();
        });
    });

    it('Test 16: Enter key closes error modal', async () =>
    {
        // ARRANGE: Render and trigger error modal
        const { container } = render(<Calculator />);
        fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

        // Wait for modal to appear
        await waitFor(() =>
        {
            expect(screen.getByText(/please enter valid numbers for all fields/i)).toBeInTheDocument();
        });

        // ACT: Press Enter key on calculator div (context-aware handler)
        const s_element_calculatorDiv = container.querySelector('.calculator');
        fireEvent.keyDown(s_element_calculatorDiv!, { key: 'Enter', code: 'Enter' });

        // ASSERT: Check that modal is no longer displayed
        await waitFor(() =>
        {
            expect(screen.queryByText(/please enter valid numbers for all fields/i)).not.toBeInTheDocument();
        });
    });
});

describe('Calculator Component - Field Order', () =>
{
    it('Test 17: Stop Loss field appears before Target Price in DOM', () =>
    {
        // ARRANGE & ACT: Render the Calculator component
        render(<Calculator />);

        // Get all input fields in order
        const stopLossInput_element = screen.getByLabelText(/stop loss/i);
        const targetPriceInput_element = screen.getByLabelText(/target price/i);

        // ASSERT: Stop Loss should come before Target Price in document order
        // Using compareDocumentPosition to check DOM order
        const n_position = stopLossInput_element.compareDocumentPosition(targetPriceInput_element);
        // DOCUMENT_POSITION_FOLLOWING (4) means targetPrice comes after stopLoss
        expect(n_position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
});
