/**
 * Type definitions for Position Size Calculator
 * Defines interfaces for trade inputs and calculation outputs
 */

// Trade direction type - either Long (buy) or Short (sell)
export type TradeDirection = 'Long' | 'Short';

// Instrument type - supported trading instruments
export type InstrumentType = 'EURUSD' | 'XAUUSD' | 'XAGUSD' | 'WTI' | 'UKOIL';

/**
 * Configuration for a trading instrument
 */
export interface InstrumentConfig
{
    n_contractSize: number; // Contract size for the instrument
    n_leverage: number;     // Leverage ratio for the instrument
}

/**
 * Map of instrument configurations
 */
export const INSTRUMENT_CONFIGS: Record<InstrumentType, InstrumentConfig> =
{
    EURUSD: { n_contractSize: 100000, n_leverage: 30 },
    XAUUSD: { n_contractSize: 100, n_leverage: 20 },
    XAGUSD: { n_contractSize: 5000, n_leverage: 10 },
    WTI: { n_contractSize: 100, n_leverage: 10 },
    UKOIL: { n_contractSize: 100, n_leverage: 10 }
};

/**
 * Input data for position size calculation
 */
export interface TradeInput
{
    n_entryPrice: number;        // Entry price for the trade
    n_targetPrice: number;       // Target price for taking profit
    n_stopLoss: number;          // Stop loss price to limit losses
    n_riskAmount: number;        // Amount of money willing to risk
    s_direction: TradeDirection; // Trade direction (Long or Short)
    s_instrument: InstrumentType; // Trading instrument (e.g., EURUSD, XAUUSD)
}

/**
 * Successful calculation result
 */
export interface CalculationResult
{
    n_lotSize: number;          // Lot size to enter in trading platform (2 decimal places)
    n_quantity: number;         // Quantity (lot_size × contract_size)
    n_risk: number;             // Actual risk amount in native currency
    n_reward: number;           // Potential reward amount in native currency
    n_rewardRiskRatio: number;  // Ratio of reward to risk
}

/**
 * Error result when validation fails
 */
export interface CalculationError
{
    b_error: true;      // Error flag (always true for errors)
    s_message: string;  // Human-readable error message
}
