/**
 * Type definitions for Position Size Calculator
 * Defines interfaces for trade inputs and calculation outputs
 *
 * Account Currency: GBP (British Pounds)
 * All calculations convert to GBP for accurate position sizing
 */

// Trade direction type - either Long (buy) or Short (sell)
export type TradeDirection = 'Long' | 'Short';

/**
 * Instrument type - supported trading instrument categories
 *
 * FX pairs are grouped by quote currency (the second currency in the pair):
 * - FX_GBP: Pairs like EURGBP, USDGBP where quote currency matches account currency (no conversion needed)
 * - FX_USD: Pairs like EURUSD, GBPUSD where quote currency is USD (needs USD/GBP conversion)
 * - FX_JPY: Pairs like USDJPY, EURJPY where quote currency is JPY (needs JPY/GBP conversion)
 * - FX_CHF: Pairs like USDCHF, EURCHF where quote currency is CHF (needs CHF/GBP conversion)
 *
 * Commodities:
 * - XAUUSD: Gold priced in USD (needs USD/GBP conversion)
 * - WTI: West Texas Intermediate crude oil priced in USD (needs USD/GBP conversion)
 *
 * Stock Indices:
 * - Indices: Stock market indices like US500, UK100 (needs USD/GBP conversion for US indices)
 */
export type InstrumentType = 'FX_GBP' | 'FX_USD' | 'FX_JPY' | 'FX_CHF' | 'XAUUSD' | 'WTI' | 'Indices';

/**
 * Quote currency type - the currency in which profit/loss is denominated
 * This determines which exchange rate is needed for conversion to account currency (GBP)
 */
export type QuoteCurrency = 'GBP' | 'USD' | 'JPY' | 'CHF';

/**
 * Configuration for a trading instrument
 * Contains all parameters needed for position size calculation
 */
export interface InstrumentConfig
{
    n_contractSize: number; // Contract size (units per lot) for the instrument
    n_leverage: number; // Leverage ratio offered by broker for this instrument
    s_quoteCurrency: QuoteCurrency; // Currency in which P&L is calculated (for conversion to GBP)
}

/**
 * Map of instrument configurations
 *
 * Contract sizes:
 * - FX pairs: 100,000 units (1 standard lot = 100,000 base currency units)
 * - Gold (XAUUSD): 100 troy ounces per lot
 * - Oil (WTI): 100 barrels per lot
 * - Indices: 1 unit per lot (price * lot size = position value)
 *
 * Quote currencies determine conversion:
 * - GBP quote: No conversion needed (account currency)
 * - USD quote: Multiply by USD/GBP rate
 * - JPY quote: Multiply by JPY/GBP rate
 * - CHF quote: Multiply by CHF/GBP rate
 */
export const INSTRUMENT_CONFIGS: Record<InstrumentType, InstrumentConfig> =
{
    FX_GBP: { n_contractSize: 100000, n_leverage: 30, s_quoteCurrency: 'GBP' },  // EURGBP, USDGBP etc.
    FX_USD: { n_contractSize: 100000, n_leverage: 30, s_quoteCurrency: 'USD' },  // EURUSD, GBPUSD etc.
    FX_JPY: { n_contractSize: 100000, n_leverage: 30, s_quoteCurrency: 'JPY' },  // USDJPY, EURJPY etc.
    FX_CHF: { n_contractSize: 100000, n_leverage: 30, s_quoteCurrency: 'CHF' },  // USDCHF, EURCHF etc.
    XAUUSD: { n_contractSize: 100, n_leverage: 20, s_quoteCurrency: 'USD' },     // Gold in USD
    WTI: { n_contractSize: 100, n_leverage: 10, s_quoteCurrency: 'USD' },        // Oil in USD
    Indices: { n_contractSize: 1, n_leverage: 20, s_quoteCurrency: 'USD' }       // US500, UK100 etc.
};

/**
 * Input data for position size calculation
 * All prices should be in the instrument's native currency
 */
export interface TradeInput
{
    n_entryPrice: number; // Entry price for the trade
    n_targetPrice: number; // Target price for taking profit
    n_stopLoss: number; // Stop loss price to limit losses
    n_riskAmount: number; // Amount of money willing to risk (in account currency GBP)
    s_direction: TradeDirection; // Trade direction (Long or Short)
    s_instrument: InstrumentType; // Trading instrument category
    n_conversionRate: number; // Exchange rate to convert quote currency to GBP (1.0 for GBP pairs)
}

/**
 * Successful calculation result
 * All monetary values are in account currency (GBP)
 */
export interface CalculationResult
{
    n_lotSize: number; // Lot size to enter in trading platform (2 decimal places)
    n_quantity: number; // Quantity (lot_size * contract_size)
    n_risk: number; // Actual risk amount in account currency (GBP)
    n_reward: number; // Potential reward amount in account currency (GBP)
    n_rewardRiskRatio: number; // Ratio of reward to risk (e.g., 2.5 means 2.5:1)
}

/**
 * Error result when validation fails
 */
export interface CalculationError
{
    b_error: true; // Error flag (always true for errors)
    s_message: string; // Human-readable error message
}
