/**
 * Type definitions for Position Size Calculator
 * Defines interfaces for trade inputs and calculation outputs
 */

// Trade direction type - either Long (buy) or Short (sell)
export type TradeDirection = 'Long' | 'Short';

/**
 * Input data for position size calculation
 */
export interface TradeInput
{
    n_entryPrice: number;    // Entry price for the trade
    n_targetPrice: number;   // Target price for taking profit
    n_stopLoss: number;      // Stop loss price to limit losses
    n_riskAmount: number;    // Amount of money willing to risk
    s_direction: TradeDirection; // Trade direction (Long or Short)
}

/**
 * Successful calculation result
 */
export interface CalculationResult
{
    n_positionSize: number;     // Number of shares/units to buy
    n_rewardRiskRatio: number;  // Ratio of potential reward to risk
    n_potentialProfit: number;  // Potential profit if target is hit
    n_potentialLoss: number;    // Potential loss if stop is hit (equals risk amount)
}

/**
 * Error result when validation fails
 */
export interface CalculationError
{
    b_error: true;      // Error flag (always true for errors)
    s_message: string;  // Human-readable error message
}
