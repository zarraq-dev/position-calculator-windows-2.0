/**
 * Position Size Calculator - Business Logic
 * Contains all calculation functions for position sizing
 */

import type { TradeInput, CalculationResult, CalculationError } from './types';

/**
 * Rounds a number to a specified number of decimal places
 * Handles floating-point precision issues in JavaScript
 *
 * How it works:
 * 1. Create decimal shifter (10^n_decimals) to shift decimal point right
 * 2. Multiply value by shifter to move target decimals into whole number positions
 * 3. Use Math.round() which works perfectly on whole numbers
 * 4. Divide by shifter to shift decimal point back to original position
 *
 * Example: Round 1.23456 to 2 decimals
 * - Shifter = 10^2 = 100
 * - Multiply: 1.23456 × 100 = 123.456
 * - Round: Math.round(123.456) = 123
 * - Divide: 123 / 100 = 1.23
 *
 * @param n_value - The number to round
 * @param n_decimals - Number of decimal places to preserve (9 for crypto precision)
 * @returns Rounded number with specified decimal precision
 */
function roundToDecimals(n_value: number, n_decimals: number): number
{
    const n_decimalShifter: number = Math.pow(10, n_decimals); // Calculate 10^n_decimals to shift decimal point
    return Math.round(n_value * n_decimalShifter) / n_decimalShifter; // Shift right, round, shift back left
}

/**
 * Validates trade input parameters
 * Checks for negative values, zero risk, invalid stop loss placement, and invalid target placement
 *
 * @param tradeInput_data - Trade parameters to validate
 * @returns CalculationError if validation fails, null if validation passes
 */
function validateInputs(tradeInput_data: TradeInput): CalculationError | null
{
    // Extract input values for readability
    const n_entryPrice: number = tradeInput_data.n_entryPrice; // Entry price for the trade
    const n_targetPrice: number = tradeInput_data.n_targetPrice; // Target price for profit
    const n_stopLoss: number = tradeInput_data.n_stopLoss; // Stop loss price
    const n_riskAmount: number = tradeInput_data.n_riskAmount; // Amount willing to risk
    const s_direction: string = tradeInput_data.s_direction; // Trade direction (Long/Short)

    // VALIDATION 1: Check for negative price values
    if (n_entryPrice <= 0 || n_targetPrice <= 0 || n_stopLoss <= 0)
    {
        return {
            b_error: true,
            s_message: 'All price values must be positive numbers'
        };
    }

    // VALIDATION 2: Check for zero or negative risk amount
    if (n_riskAmount <= 0)
    {
        return {
            b_error: true,
            s_message: 'Risk amount is zero or no value has been entered'
        };
    }

    // VALIDATION 3: Check for entry price equals stop loss
    if (n_entryPrice === n_stopLoss)
    {
        return {
            b_error: true,
            s_message: 'Entry price and stop loss cannot be the same'
        };
    }

    // VALIDATION 4: Direction-specific validations
    if (s_direction === 'Long')
    {
        // VALIDATION 4A: For long trades, stop must be below entry
        if (n_stopLoss >= n_entryPrice)
        {
            return {
                b_error: true,
                s_message: 'Stop loss must be below entry price for long positions'
            };
        }

        // VALIDATION 4B: For long trades, target must be above entry
        if (n_targetPrice <= n_entryPrice)
        {
            return {
                b_error: true,
                s_message: 'Target price must be above entry price for long positions'
            };
        }
    }
    else if (s_direction === 'Short')
    {
        // VALIDATION 4C: For short trades, stop must be above entry
        if (n_stopLoss <= n_entryPrice)
        {
            return {
                b_error: true,
                s_message: 'Stop loss must be above entry price for short positions'
            };
        }

        // VALIDATION 4D: For short trades, target must be below entry
        if (n_targetPrice >= n_entryPrice)
        {
            return {
                b_error: true,
                s_message: 'Target price must be below entry price for short positions'
            };
        }
    }

    // All validations passed
    return null;
}

/**
 * Calculate position size and related metrics
 * @param tradeInput_data - Trade input data containing prices and risk amount
 * @returns CalculationResult on success, CalculationError on validation failure
 */
export function calculatePosition(tradeInput_data: TradeInput): CalculationResult | CalculationError
{
    // STEP 1: Extract input values for readability
    const n_entryPrice: number = tradeInput_data.n_entryPrice; // Entry price for the trade
    const n_targetPrice: number = tradeInput_data.n_targetPrice; // Target price for profit
    const n_stopLoss: number = tradeInput_data.n_stopLoss; // Stop loss price
    const n_riskAmount: number = tradeInput_data.n_riskAmount; // Amount willing to risk

    // STEP 2: Validate inputs
    const validationError = validateInputs(tradeInput_data);
    if (validationError !== null)
    {
        return validationError;
    }

    // STEP 3: Calculate risk per share (distance from entry to stop loss)
    const n_riskPerShare: number = Math.abs(n_entryPrice - n_stopLoss); // Risk per share/unit

    // STEP 4: Calculate position size (round to 9 decimals for crypto precision)
    const n_positionSize: number = roundToDecimals(n_riskAmount / n_riskPerShare, 9); // Number of shares/units to buy

    // STEP 5: Calculate reward per share (distance from entry to target)
    const n_rewardPerShare: number = Math.abs(n_targetPrice - n_entryPrice); // Reward per share/unit

    // STEP 6: Calculate reward:risk ratio
    const n_rewardRiskRatio: number = n_rewardPerShare / n_riskPerShare; // Ratio of reward to risk

    // STEP 7: Calculate potential profit
    const n_potentialProfit: number = n_positionSize * n_rewardPerShare; // Total potential profit

    // STEP 8: Potential loss equals risk amount (by definition)
    const n_potentialLoss: number = n_riskAmount; // Total potential loss

    // STEP 9: Return successful calculation result
    return {
        n_positionSize: n_positionSize,
        n_rewardRiskRatio: n_rewardRiskRatio,
        n_potentialProfit: n_potentialProfit,
        n_potentialLoss: n_potentialLoss
    };
}
