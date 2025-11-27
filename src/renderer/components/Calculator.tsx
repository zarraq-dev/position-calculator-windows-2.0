/**
 * Calculator Component
 * Main calculator interface with inputs and results display
 *
 * Features:
 * - Form-based input with keyboard navigation (Arrow Up/Down)
 * - Live currency conversion via Frankfurter API
 * - Instrument categories grouped by quote currency
 * - Real-time position size and reward:risk calculation
 *
 * Account Currency: GBP (British Pounds)
 */

import React, { useState, useEffect } from 'react';
import { calculatePosition } from '../../shared/calculations';
import { getExchangeRate } from '../../shared/currencyService';
import { INSTRUMENT_CONFIGS } from '../../shared/types';
import type { TradeDirection, InstrumentType, CalculationResult, CalculationError } from '../../shared/types';
import InputField from './InputField';
import ErrorModal from './ErrorModal';

/**
 * Calculator component for position size calculations
 * Handles user input, currency conversion, and displays results
 */
export default function Calculator(): React.ReactElement
{
    // STEP 1: Define state for form inputs
    const [s_entryPrice, setEntryPrice] = useState<string>(''); // Entry price input value
    const [s_stopLoss, setStopLoss] = useState<string>(''); // Stop loss input value (moved before target)
    const [s_targetPrice, setTargetPrice] = useState<string>(''); // Target price input value
    const [s_riskAmount, setRiskAmount] = useState<string>(''); // Risk amount input value (in GBP)
    const [s_direction, setDirection] = useState<TradeDirection>('Long'); // Trade direction
    const [s_instrument, setInstrument] = useState<InstrumentType>('XAUUSD'); // Trading instrument category

    // STEP 2: Define state for calculation results and errors
    const [calculationResult_data, setCalculationResult] = useState<CalculationResult | null>(null); // Calculation results
    const [s_errorMessage, setErrorMessage] = useState<string>(''); // Error message if calculation fails
    const [b_showErrorModal, setShowErrorModal] = useState<boolean>(false); // Whether error modal should be visible
    const [b_isCalculating, setIsCalculating] = useState<boolean>(false); // Loading state during API call

    // Auto-focus on Entry Price field when component mounts
    useEffect(() =>
    {
        const entryPriceField_element: HTMLElement | null = document.getElementById('entryPrice'); // Get entry price input
        if (entryPriceField_element)
        {
            entryPriceField_element.focus(); // Focus the entry price field
        }
    }, []); // Empty dependency array - runs once on mount

    // Array of input field IDs in order for arrow key navigation
    // Order: Instrument -> Entry -> Stop Loss -> Target -> Risk -> Direction
    const array_s_fieldIds: string[] = ['instrument', 'entryPrice', 'stopLoss', 'targetPrice', 'riskAmount', 'direction'];

    // STEP 3: Handle arrow key navigation between input fields
    const handleArrowNavigation = (event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>): void =>
    {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')
        {
            return; // Only handle arrow up/down keys
        }

        event.preventDefault(); // Prevent default scrolling behavior

        const s_currentId: string = (event.target as HTMLElement).id; // Get current field ID
        const n_currentIndex: number = array_s_fieldIds.indexOf(s_currentId); // Find current index

        if (n_currentIndex === -1)
        {
            return; // Current field not in list
        }

        let n_nextIndex: number = n_currentIndex; // Initialize next index

        if (event.key === 'ArrowUp')
        {
            n_nextIndex = n_currentIndex > 0 ? n_currentIndex - 1 : array_s_fieldIds.length - 1; // Move up, wrap to bottom
        }
        else if (event.key === 'ArrowDown')
        {
            n_nextIndex = n_currentIndex < array_s_fieldIds.length - 1 ? n_currentIndex + 1 : 0; // Move down, wrap to top
        }

        const s_nextFieldId: string = array_s_fieldIds[n_nextIndex]; // Get next field ID
        const nextField_element: HTMLElement | null = document.getElementById(s_nextFieldId); // Find next field element

        if (nextField_element)
        {
            nextField_element.focus(); // Focus the next field
        }
    };

    // STEP 4: Handle calculate button click
    // This is async because we need to fetch exchange rates from the API
    const handleCalculate = async (): Promise<void> =>
    {
        // Clear previous results and errors
        setCalculationResult(null);
        setErrorMessage('');
        setShowErrorModal(false);
        setIsCalculating(true); // Show loading state

        try
        {
            // Parse input values to numbers
            const n_entryPrice: number = parseFloat(s_entryPrice); // Parsed entry price
            const n_targetPrice: number = parseFloat(s_targetPrice); // Parsed target price
            const n_stopLoss: number = parseFloat(s_stopLoss); // Parsed stop loss
            const n_riskAmount: number = parseFloat(s_riskAmount); // Parsed risk amount (in GBP)

            // Validate that all inputs are valid numbers
            if (isNaN(n_entryPrice) || isNaN(n_targetPrice) || isNaN(n_stopLoss) || isNaN(n_riskAmount))
            {
                setErrorMessage('Please enter valid numbers for all fields');
                setShowErrorModal(true);
                return;
            }

            // Get the quote currency for the selected instrument
            const instrumentConfig = INSTRUMENT_CONFIGS[s_instrument]; // Get instrument configuration
            const s_quoteCurrency = instrumentConfig.s_quoteCurrency; // Quote currency (USD, GBP, JPY, CHF)

            // Fetch the exchange rate for converting quote currency to GBP
            // For GBP pairs this returns 1.0, for others it fetches from Frankfurter API
            const n_conversionRate: number = await getExchangeRate(s_quoteCurrency);

            // Call calculation function with all parameters including conversion rate
            const result = calculatePosition({
                n_entryPrice,
                n_targetPrice,
                n_stopLoss,
                n_riskAmount,
                s_direction,
                s_instrument,
                n_conversionRate
            });

            // Check if result is an error
            if ('b_error' in result)
            {
                setErrorMessage((result as CalculationError).s_message);
                setShowErrorModal(true);
            }
            else
            {
                setCalculationResult(result as CalculationResult);
            }
        }
        catch (error)
        {
            // Handle any errors (e.g., network failure when fetching rates)
            const s_errorMsg: string = error instanceof Error ? error.message : 'An unexpected error occurred';
            setErrorMessage(s_errorMsg);
            setShowErrorModal(true);
        }
        finally
        {
            setIsCalculating(false); // Hide loading state
        }
    };

    // STEP 5: Handle Enter key press (context-aware)
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void =>
    {
        if (event.key === 'Enter')
        {
            // Check if error modal is visible
            if (b_showErrorModal)
            {
                handleCloseModal(); // Close modal if it's open
            }
            else if (!b_isCalculating)
            {
                handleCalculate(); // Trigger calculation if modal is not open and not already calculating
            }
        }
    };

    // STEP 6: Handle clear button click
    const handleClear = (): void =>
    {
        setEntryPrice('');
        setStopLoss('');
        setTargetPrice('');
        setRiskAmount('');
        setDirection('Long');
        setInstrument('XAUUSD'); // Default to Gold
        setCalculationResult(null);
        setErrorMessage('');
        setShowErrorModal(false);
    };

    // STEP 7: Handle error modal close
    const handleCloseModal = (): void =>
    {
        setShowErrorModal(false); // Hide the modal
    };

    // STEP 8: Format reward:risk ratio display
    const formatRewardRiskRatio = (): string =>
    {
        if (!calculationResult_data)
        {
            return '--:1'; // No calculation yet, show placeholder
        }

        const n_rewardRatio: number = calculationResult_data.n_rewardRiskRatio; // Get the reward ratio value

        // Check if reward ratio is a whole number
        if (Number.isInteger(n_rewardRatio))
        {
            return `${n_rewardRatio}:1`; // Display without decimal (e.g., "2:1")
        }
        else
        {
            return `${n_rewardRatio.toFixed(1)}:1`; // Display with one decimal (e.g., "2.5:1")
        }
    };

    // STEP 9: Render component
    return (
        <div className="calculator" onKeyDown={handleKeyDown} tabIndex={0}>
            <h1>Position Size Calculator</h1>

            {/* Input Fields Section */}
            <div className="inputs-section">
                {/* Instrument Dropdown - Grouped by quote currency */}
                <div className="input-group">
                    <label htmlFor="instrument">Instrument:</label>
                    <select
                        id="instrument"
                        value={s_instrument}
                        onChange={(e) => setInstrument(e.target.value as InstrumentType)}
                        onKeyDown={handleArrowNavigation}
                    >
                        {/* FX pairs grouped by quote currency */}
                        <option value="FX_GBP">FX (GBP pairs)</option>
                        <option value="FX_USD">FX (USD pairs)</option>
                        <option value="FX_JPY">FX (JPY pairs)</option>
                        <option value="FX_CHF">FX (CHF pairs)</option>
                        {/* Commodities */}
                        <option value="XAUUSD">Gold (XAUUSD)</option>
                        <option value="WTI">Oil (WTI)</option>
                        {/* Stock Indices */}
                        <option value="Indices">Stock Indices</option>
                    </select>
                </div>

                {/* Entry Price - First price input */}
                <InputField
                    s_label="Entry Price"
                    s_id="entryPrice"
                    s_value={s_entryPrice}
                    onChange={setEntryPrice}
                    onKeyDown={handleArrowNavigation}
                />

                {/* Stop Loss - Moved before Target Price for logical workflow */}
                <InputField
                    s_label="Stop Loss"
                    s_id="stopLoss"
                    s_value={s_stopLoss}
                    onChange={setStopLoss}
                    onKeyDown={handleArrowNavigation}
                />

                {/* Target Price - After Stop Loss */}
                <InputField
                    s_label="Target Price"
                    s_id="targetPrice"
                    s_value={s_targetPrice}
                    onChange={setTargetPrice}
                    onKeyDown={handleArrowNavigation}
                />

                {/* Risk Amount - In account currency (GBP) */}
                <InputField
                    s_label="Risk Amount"
                    s_id="riskAmount"
                    s_value={s_riskAmount}
                    onChange={setRiskAmount}
                    onKeyDown={handleArrowNavigation}
                />

                {/* Direction Dropdown - Long or Short */}
                <div className="input-group">
                    <label htmlFor="direction">Direction:</label>
                    <select
                        id="direction"
                        value={s_direction}
                        onChange={(e) => setDirection(e.target.value as TradeDirection)}
                        onKeyDown={handleArrowNavigation}
                    >
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    className="calculate-button"
                    onClick={handleCalculate}
                    disabled={b_isCalculating}
                >
                    {b_isCalculating ? 'Calculating...' : 'Calculate'}
                </button>
                <button className="clear-button" onClick={handleClear}>
                    Clear
                </button>
            </div>

            {/* Results Display Section - Always Visible */}
            <div className="results-section">
                <h2>Results</h2>
                <div className="result-item">
                    <span className="result-label">Lot Size:</span>
                    <span className="result-value">
                        {calculationResult_data ? calculationResult_data.n_lotSize : '--'}
                    </span>
                </div>
                <div className="result-item">
                    <span className="result-label">Reward:Risk:</span>
                    <span className="result-value">
                        {formatRewardRiskRatio()}
                    </span>
                </div>
            </div>

            {/* Close Window Button */}
            <button
                className="close-window-button"
                onClick={() => window.electronAPI?.closeWindow()}
            >
                Close
            </button>

            {/* Error Modal Display */}
            <ErrorModal
                s_message={s_errorMessage}
                b_isVisible={b_showErrorModal}
                onClose={handleCloseModal}
            />
        </div>
    );
}
