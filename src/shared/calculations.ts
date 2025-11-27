/**
 * Position Size Calculator - Business Logic
 * Contains all calculation functions for position sizing
 *
 * Account Currency: GBP (British Pounds)
 *
 * Core Formulas (with currency conversion):
 * 1. price_diff = |stop_loss_price - entry_price| (in quote currency)
 * 2. risk_in_quote = risk_amount_gbp / quote_to_gbp_rate (convert GBP risk to quote currency)
 * 3. lot_size = risk_in_quote / (price_diff * contract_size)
 * 4. quantity = lot_size * contract_size
 * 5. risk = price_diff * quantity * quote_to_gbp_rate (convert back to GBP)
 * 6. reward = |target_price - entry_price| * quantity * quote_to_gbp_rate (convert to GBP)
 * 7. reward_risk_ratio = reward / risk
 *
 * Why currency conversion is needed:
 * - P&L for a trade is calculated in the quote currency (second currency in the pair)
 * - For EURUSD: P&L is in USD, for USDJPY: P&L is in JPY
 * - Account is in GBP, so we need to convert quote currency P&L to GBP
 * - The conversion rate (quote_to_gbp) tells us how many GBP one unit of quote currency is worth
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
    const n_conversionRate: number = tradeInput_data.n_conversionRate; // Quote to GBP conversion rate

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

    // VALIDATION 4: Check for valid conversion rate
    if (n_conversionRate <= 0)
    {
        return {
            b_error: true,
            s_message: 'Currency conversion rate must be a positive number'
        };
    }

    // VALIDATION 5: Direction-specific validations
    if (s_direction === 'Long')
    {
        // VALIDATION 5A: For long trades, stop must be below entry
        if (n_stopLoss >= n_entryPrice)
        {
            return {
                b_error: true,
                s_message: 'Stop loss must be below entry price for long positions'
            };
        }

        // VALIDATION 5B: For long trades, target must be above entry
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
        // VALIDATION 5C: For short trades, stop must be above entry
        if (n_stopLoss <= n_entryPrice)
        {
            return {
                b_error: true,
                s_message: 'Stop loss must be above entry price for short positions'
            };
        }

        // VALIDATION 5D: For short trades, target must be below entry
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
 * Uses instrument-specific contract sizes and currency conversion for accurate position sizing
 *
 * Currency Conversion Logic:
 * - User's risk is in GBP (account currency)
 * - Trade P&L is calculated in quote currency (e.g., USD for EURUSD, JPY for USDJPY)
 * - We need to convert between GBP and quote currency using the conversion rate
 * - n_conversionRate = how many GBP one unit of quote currency is worth
 *   Example: If USD/GBP = 0.79, then 1 USD = 0.79 GBP
 *
 * @param tradeInput_data - Trade input data containing prices, risk amount, instrument, and conversion rate
 * @returns CalculationResult on success, CalculationError on validation failure
 */
export function calculatePosition(tradeInput_data: TradeInput): CalculationResult | CalculationError
{
    // STEP 1: Extract input values for readability
    const n_entryPrice: number = tradeInput_data.n_entryPrice; // Entry price for the trade
    const n_targetPrice: number = tradeInput_data.n_targetPrice; // Target price for profit
    const n_stopLoss: number = tradeInput_data.n_stopLoss; // Stop loss price
    const n_riskAmountGBP: number = tradeInput_data.n_riskAmount; // Amount willing to risk (in GBP)
    const s_instrument: InstrumentType = tradeInput_data.s_instrument; // Trading instrument category
    const n_quoteToGBPRate: number = tradeInput_data.n_conversionRate; // Exchange rate: 1 quote currency = X GBP

    // STEP 2: Validate inputs
    const validationError = validateInputs(tradeInput_data);
    if (validationError !== null)
    {
        return validationError;
    }

    // STEP 3: Get instrument configuration
    const instrumentConfig = INSTRUMENT_CONFIGS[s_instrument]; // Get contract size and leverage for instrument
    const n_contractSize: number = instrumentConfig.n_contractSize; // Contract size for the instrument

    // STEP 4: Calculate price difference (in quote currency)
    // price_diff = |stop_loss_price - entry_price|
    const n_priceDifferenceToStop: number = Math.abs(n_stopLoss - n_entryPrice); // Price movement to stop loss

    // STEP 5: Convert risk from GBP to quote currency
    // If account is GBP and trade P&L is in USD, we need to know how much USD risk equals our GBP risk
    // risk_in_quote = risk_gbp / quote_to_gbp_rate
    // Example: 100 GBP risk with USD/GBP = 0.79 means 100/0.79 = 126.58 USD risk
    const n_riskInQuoteCurrency: number = n_riskAmountGBP / n_quoteToGBPRate;

    // STEP 6: Calculate raw lot size (before rounding)
    // lot_size = risk_in_quote / (price_diff * contract_size)
    const n_rawLotSize: number = n_riskInQuoteCurrency / (n_priceDifferenceToStop * n_contractSize);

    // STEP 7: Round lot size to 2 decimal places (trading platform requirement)
    const n_lotSize: number = roundToDecimals(n_rawLotSize, 2);

    // STEP 8: Handle edge case where lot size rounds to zero
    // This prevents NaN errors in subsequent calculations
    if (n_lotSize === 0)
    {
        return {
            b_error: true,
            s_message: 'Position size too small - lot size rounds to zero. Increase risk amount or widen stop loss.'
        };
    }

    // STEP 9: Calculate quantity (quantity = lot_size * contract_size)
    const n_quantity: number = roundToDecimals(n_lotSize * n_contractSize, 2); // Units being traded

    // STEP 10: Calculate actual risk in GBP (using rounded lot size)
    // risk = price_diff * quantity * quote_to_gbp_rate
    // This converts the quote currency P&L back to account currency (GBP)
    const n_risk: number = roundToDecimals(n_priceDifferenceToStop * n_quantity * n_quoteToGBPRate, 2);

    // STEP 11: Calculate potential reward in GBP
    // reward = |target_price - entry_price| * quantity * quote_to_gbp_rate
    const n_priceDifferenceToTarget: number = Math.abs(n_targetPrice - n_entryPrice); // Price movement to target
    const n_reward: number = roundToDecimals(n_priceDifferenceToTarget * n_quantity * n_quoteToGBPRate, 2);

    // STEP 12: Calculate risk-reward ratio
    // risk_reward_ratio = reward / risk
    const n_rewardRiskRatio: number = roundToDecimals(n_reward / n_risk, 2);

    // STEP 13: Return successful calculation result
    return {
        n_lotSize: n_lotSize,       // Lot size to enter in platform
        n_quantity: n_quantity,     // Number of units
        n_risk: n_risk,             // Risk in GBP
        n_reward: n_reward,         // Potential reward in GBP
        n_rewardRiskRatio: n_rewardRiskRatio // Reward:Risk ratio
    };
}
