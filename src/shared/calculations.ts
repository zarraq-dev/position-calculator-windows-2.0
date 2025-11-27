/**
 * Position Size Calculator - Business Logic
 * Contains all calculation functions for position sizing
 *
 * Core Formulas:
 * 1. price_diff = |stop_loss_price - entry_price| (price difference vs stop loss)
 * 2. lot_size = risk_amount / (price_diff * contract_size)
 * 3. quantity = lot_size * contract_size
 * 4. risk = price_diff * quantity (should match user's intended risk)
 * 5. reward = |take_profit_price - entry_price| * quantity
 * 6. risk_reward_ratio = reward / risk
 */

import type { TradeInput, CalculationResult, CalculationError, InstrumentType } from './types';
import { INSTRUMENT_CONFIGS } from './types';

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
 * - Multiply: 1.23456 * 100 = 123.456
 * - Round: Math.round(123.456) = 123
 * - Divide: 123 / 100 = 1.23
 *
 * @param n_value - The number to round
 * @param n_decimals - Number of decimal places to preserve
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
 * Calculate lot size, quantity, risk, reward, and risk-reward ratio
 * Uses instrument-specific contract sizes for accurate position sizing
 *
 * @param tradeInput_data - Trade input data containing prices, risk amount, and instrument
 * @returns CalculationResult on success, CalculationError on validation failure
 */
export function calculatePosition(tradeInput_data: TradeInput): CalculationResult | CalculationError
{
    // STEP 1: Extract input values for readability
    const n_entryPrice: number = tradeInput_data.n_entryPrice; // Entry price for the trade
    const n_targetPrice: number = tradeInput_data.n_targetPrice; // Target price for profit
    const n_stopLoss: number = tradeInput_data.n_stopLoss; // Stop loss price
    const n_riskAmount: number = tradeInput_data.n_riskAmount; // Amount willing to risk
    const s_instrument: InstrumentType = tradeInput_data.s_instrument; // Trading instrument

    // STEP 2: Validate inputs
    const validationError = validateInputs(tradeInput_data);
    if (validationError !== null)
    {
        return validationError;
    }

    // STEP 3: Get instrument configuration
    const instrumentConfig = INSTRUMENT_CONFIGS[s_instrument]; // Get contract size and leverage for instrument
    const n_contractSize: number = instrumentConfig.n_contractSize; // Contract size for the instrument

    // STEP 4: Calculate price difference (price_diff = |stop_loss_price - entry_price|)
    const n_priceDifference: number = Math.abs(n_stopLoss - n_entryPrice); // Price difference from entry to stop loss

    // STEP 5: Calculate lot size (lot_size = risk_amount / (price_diff * contract_size))
    const n_lotSize: number = roundToDecimals(n_riskAmount / (n_priceDifference * n_contractSize), 2); // Lot size rounded to 2 decimals

    // STEP 6: Calculate quantity (quantity = lot_size * contract_size)
    const n_quantity: number = roundToDecimals(n_lotSize * n_contractSize, 2); // Quantity rounded to 2 decimals

    // STEP 7: Calculate risk (risk = price_diff * quantity) - should match user's intended risk
    const n_risk: number = roundToDecimals(n_priceDifference * n_quantity, 2); // Actual risk amount

    // STEP 8: Calculate reward (reward = |take_profit_price - entry_price| * quantity)
    const n_rewardPriceDifference: number = Math.abs(n_targetPrice - n_entryPrice); // Price difference from entry to target
    const n_reward: number = roundToDecimals(n_rewardPriceDifference * n_quantity, 2); // Reward amount

    // STEP 9: Calculate risk-reward ratio (risk_reward_ratio = reward / risk)
    const n_rewardRiskRatio: number = roundToDecimals(n_reward / n_risk, 2); // Risk-reward ratio

    // STEP 10: Return successful calculation result
    return {
        n_lotSize: n_lotSize,
        n_quantity: n_quantity,
        n_risk: n_risk,
        n_reward: n_reward,
        n_rewardRiskRatio: n_rewardRiskRatio
    };
}
