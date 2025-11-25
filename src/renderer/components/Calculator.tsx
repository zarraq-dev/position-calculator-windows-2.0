/**
 * Calculator Component
 * Main calculator interface with inputs and results display
 * No number pad - keyboard input only
 */

import React, { useState } from 'react';
import { calculatePosition } from '../../shared/calculations';
import type { TradeDirection, CalculationResult, CalculationError } from '../../shared/types';
import InputField from './InputField';
import ErrorModal from './ErrorModal';

/**
 * Calculator component for position size calculations
 */
export default function Calculator(): React.ReactElement
{
    // STEP 1: Define state for form inputs
    const [s_entryPrice, setEntryPrice] = useState<string>(''); // Entry price input value
    const [s_targetPrice, setTargetPrice] = useState<string>(''); // Target price input value
    const [s_stopLoss, setStopLoss] = useState<string>(''); // Stop loss input value
    const [s_riskAmount, setRiskAmount] = useState<string>(''); // Risk amount input value
    const [s_direction, setDirection] = useState<TradeDirection>('Long'); // Trade direction

    // STEP 2: Define state for calculation results
    const [calculationResult_data, setCalculationResult] = useState<CalculationResult | null>(null); // Calculation results
    const [s_errorMessage, setErrorMessage] = useState<string>(''); // Error message if calculation fails
    const [b_showErrorModal, setShowErrorModal] = useState<boolean>(false); // Whether error modal should be visible

    // STEP 3: Handle calculate button click
    const handleCalculate = (): void =>
    {
        // Clear previous results and errors
        setCalculationResult(null);
        setErrorMessage('');
        setShowErrorModal(false);

        // Parse input values to numbers
        const n_entryPrice: number = parseFloat(s_entryPrice); // Parsed entry price
        const n_targetPrice: number = parseFloat(s_targetPrice); // Parsed target price
        const n_stopLoss: number = parseFloat(s_stopLoss); // Parsed stop loss
        const n_riskAmount: number = parseFloat(s_riskAmount); // Parsed risk amount

        // Validate that all inputs are valid numbers
        if (isNaN(n_entryPrice) || isNaN(n_targetPrice) || isNaN(n_stopLoss) || isNaN(n_riskAmount))
        {
            setErrorMessage('Please enter valid numbers for all fields');
            setShowErrorModal(true);
            return;
        }

        // Call calculation function
        const result = calculatePosition({
            n_entryPrice,
            n_targetPrice,
            n_stopLoss,
            n_riskAmount,
            s_direction
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
    };

    // STEP 4: Handle Enter key press (context-aware)
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void =>
    {
        if (event.key === 'Enter')
        {
            // Check if error modal is visible
            if (b_showErrorModal)
            {
                handleCloseModal(); // Close modal if it's open
            }
            else
            {
                handleCalculate(); // Trigger calculation if modal is not open
            }
        }
    };

    // STEP 5: Handle clear button click
    const handleClear = (): void =>
    {
        setEntryPrice('');
        setTargetPrice('');
        setStopLoss('');
        setRiskAmount('');
        setDirection('Long');
        setCalculationResult(null);
        setErrorMessage('');
        setShowErrorModal(false);
    };

    // STEP 6: Handle error modal close
    const handleCloseModal = (): void =>
    {
        setShowErrorModal(false); // Hide the modal
    };

    // STEP 7: Format reward:risk ratio display
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

    // STEP 8: Render component
    return (
        <div className="calculator" onKeyDown={handleKeyDown} tabIndex={0}>
            <h1>Position Size Calculator</h1>

            {/* Input Fields Section */}
            <div className="inputs-section">
                <InputField
                    s_label="Entry Price"
                    s_id="entryPrice"
                    s_value={s_entryPrice}
                    onChange={setEntryPrice}
                />

                <InputField
                    s_label="Target Price"
                    s_id="targetPrice"
                    s_value={s_targetPrice}
                    onChange={setTargetPrice}
                />

                <InputField
                    s_label="Stop Loss"
                    s_id="stopLoss"
                    s_value={s_stopLoss}
                    onChange={setStopLoss}
                />

                <InputField
                    s_label="Risk Amount"
                    s_id="riskAmount"
                    s_value={s_riskAmount}
                    onChange={setRiskAmount}
                />

                {/* Direction Dropdown */}
                <div className="input-group">
                    <label htmlFor="direction">Direction:</label>
                    <select
                        id="direction"
                        value={s_direction}
                        onChange={(e) => setDirection(e.target.value as TradeDirection)}
                    >
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="calculate-button" onClick={handleCalculate}>
                    Calculate
                </button>
                <button className="clear-button" onClick={handleClear}>
                    Clear
                </button>
            </div>

            {/* Results Display Section - Always Visible */}
            <div className="results-section">
                <h2>Results</h2>
                <div className="result-item">
                    <span className="result-label">Position Size:</span>
                    <span className="result-value">
                        {calculationResult_data ? calculationResult_data.n_positionSize : '--'}
                    </span>
                </div>
                <div className="result-item">
                    <span className="result-label">Reward:Risk:</span>
                    <span className="result-value">
                        {formatRewardRiskRatio()}
                    </span>
                </div>
            </div>

            {/* Error Modal Display */}
            <ErrorModal
                s_message={s_errorMessage}
                b_isVisible={b_showErrorModal}
                onClose={handleCloseModal}
            />
        </div>
    );
}
