/**
 * Test suite for position size calculation logic
 * Following strict TDD approach - tests written before implementation
 *
 * Account Currency: GBP (British Pounds)
 *
 * Core Formulas (with currency conversion):
 * 1. price_diff = |stop_loss_price - entry_price| (in quote currency)
 * 2. risk_in_quote = risk_amount_gbp / quote_to_gbp_rate
 * 3. lot_size = risk_in_quote / (price_diff * contract_size)
 * 4. quantity = lot_size * contract_size
 * 5. risk = price_diff * quantity * quote_to_gbp_rate (in GBP)
 * 6. reward = |target_price - entry_price| * quantity * quote_to_gbp_rate (in GBP)
 * 7. risk_reward_ratio = reward / risk
 *
 * Instrument Contract Sizes:
 * - FX_GBP, FX_USD, FX_JPY, FX_CHF: 100000
 * - XAUUSD: 100
 * - WTI: 100
 * - Indices: 1
 */

import { describe, it, expect } from 'vitest';
import { calculatePosition } from '../src/shared/calculations';
import type { TradeInput, CalculationResult, CalculationError } from '../src/shared/types';

describe('Position Size Calculator - Basic Calculations (XAUUSD with USD conversion)', () =>
{
    // All XAUUSD tests use n_conversionRate = 0.79 (1 USD = 0.79 GBP)
    // This means a 150 GBP risk = 189.87 USD risk in quote currency

    it('Test 1: XAUUSD Long Trade - Lot Size with USD conversion', () =>
    {
        // ARRANGE: XAUUSD trade (contract_size = 100, quote = USD)
        // Entry: 2000, Stop: 1990, price_diff = 10
        // risk_in_usd = 150 / 0.79 = 189.87
        // lot_size = 189.87 / (10 * 100) = 0.19 (rounded)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79 // 1 USD = 0.79 GBP
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size (189.87 / 1000 = 0.19 rounded)
        expect((result as CalculationResult).n_lotSize).toBe(0.19);
    });

    it('Test 2: XAUUSD Long Trade - Quantity', () =>
    {
        // ARRANGE: Same as Test 1
        // quantity = lot_size * contract_size = 0.19 * 100 = 19
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify quantity is 19
        expect((result as CalculationResult).n_quantity).toBe(19);
    });

    it('Test 3: XAUUSD Long Trade - Risk (back to GBP)', () =>
    {
        // ARRANGE: Same as Test 1
        // risk = price_diff * quantity * quote_to_gbp = 10 * 19 * 0.79 = 150.10
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify risk is close to input risk (may differ slightly due to rounding)
        expect((result as CalculationResult).n_risk).toBe(150.1);
    });

    it('Test 4: XAUUSD Long Trade - Reward (in GBP)', () =>
    {
        // ARRANGE: Same as Test 1
        // reward_price_diff = |2030 - 2000| = 30
        // reward = 30 * 19 * 0.79 = 450.30
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify reward is 450.30 GBP
        expect((result as CalculationResult).n_reward).toBe(450.3);
    });

    it('Test 5: XAUUSD Long Trade - Reward:Risk Ratio', () =>
    {
        // ARRANGE: Same as Test 1
        // risk_reward_ratio = reward / risk = 450.30 / 150.10 = 3.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify reward:risk ratio is 3
        expect((result as CalculationResult).n_rewardRiskRatio).toBe(3);
    });
});

describe('Position Size Calculator - GBP Quote Currency (No Conversion)', () =>
{
    it('Test 6: FX_GBP Trade - Lot Size (no conversion needed)', () =>
    {
        // ARRANGE: FX_GBP trade (e.g., EURGBP - contract_size = 100000)
        // Quote currency is GBP, so conversion rate = 1.0
        // Entry: 0.8500, Stop: 0.8490, price_diff = 0.001
        // lot_size = 100 / (0.001 * 100000) = 1.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 0.8500,
            n_targetPrice: 0.8530,
            n_stopLoss: 0.8490,
            n_riskAmount: 100,
            s_direction: 'Long',
            s_instrument: 'FX_GBP',
            n_conversionRate: 1.0 // GBP to GBP = 1.0
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 1.0
        expect((result as CalculationResult).n_lotSize).toBe(1);
    });

    it('Test 7: FX_GBP Trade - Risk equals input (no conversion)', () =>
    {
        // ARRANGE: Same as Test 6
        // When quote = GBP and rate = 1.0, risk should match input exactly
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 0.8500,
            n_targetPrice: 0.8530,
            n_stopLoss: 0.8490,
            n_riskAmount: 100,
            s_direction: 'Long',
            s_instrument: 'FX_GBP',
            n_conversionRate: 1.0
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify risk matches input exactly
        expect((result as CalculationResult).n_risk).toBe(100);
    });
});

describe('Position Size Calculator - Different Quote Currencies', () =>
{
    it('Test 8: FX_USD Trade - USD quote with conversion', () =>
    {
        // ARRANGE: FX_USD trade (e.g., EURUSD)
        // Entry: 1.1000, Stop: 1.0990, price_diff = 0.001
        // risk_in_usd = 79 / 0.79 = 100 USD
        // lot_size = 100 / (0.001 * 100000) = 1.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 1.1000,
            n_targetPrice: 1.1030,
            n_stopLoss: 1.0990,
            n_riskAmount: 79, // 79 GBP
            s_direction: 'Long',
            s_instrument: 'FX_USD',
            n_conversionRate: 0.79 // 1 USD = 0.79 GBP
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 1.0
        expect((result as CalculationResult).n_lotSize).toBe(1);
    });

    it('Test 9: FX_JPY Trade - JPY quote with conversion', () =>
    {
        // ARRANGE: FX_JPY trade (e.g., USDJPY)
        // Entry: 150.00, Stop: 149.00, price_diff = 1.0
        // rate = 0.0053 (1 JPY = 0.0053 GBP)
        // risk_in_jpy = 53 / 0.0053 = 10000 JPY
        // lot_size = 10000 / (1.0 * 100000) = 0.10
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 150.00,
            n_targetPrice: 153.00,
            n_stopLoss: 149.00,
            n_riskAmount: 53, // 53 GBP
            s_direction: 'Long',
            s_instrument: 'FX_JPY',
            n_conversionRate: 0.0053 // 1 JPY = 0.0053 GBP
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 0.10
        expect((result as CalculationResult).n_lotSize).toBe(0.1);
    });

    it('Test 10: WTI Trade - Oil with USD quote', () =>
    {
        // ARRANGE: WTI (crude oil) trade - contract_size = 100, quote = USD
        // Entry: 70.00, Stop: 69.00, price_diff = 1.0
        // risk_in_usd = 158 / 0.79 = 200 USD
        // lot_size = 200 / (1.0 * 100) = 2.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 70.00,
            n_targetPrice: 73.00,
            n_stopLoss: 69.00,
            n_riskAmount: 158, // 158 GBP
            s_direction: 'Long',
            s_instrument: 'WTI',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 2.0
        expect((result as CalculationResult).n_lotSize).toBe(2);
    });

    it('Test 11: Indices Trade - Stock index with USD quote', () =>
    {
        // ARRANGE: Indices trade (e.g., US500) - contract_size = 1, quote = USD
        // Entry: 5000, Stop: 4950, price_diff = 50
        // risk_in_usd = 79 / 0.79 = 100 USD
        // lot_size = 100 / (50 * 1) = 2.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 5000,
            n_targetPrice: 5150,
            n_stopLoss: 4950,
            n_riskAmount: 79, // 79 GBP
            s_direction: 'Long',
            s_instrument: 'Indices',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 2.0
        expect((result as CalculationResult).n_lotSize).toBe(2);
    });
});

describe('Position Size Calculator - Validation Tests', () =>
{
    it('Test 12: Invalid Long Trade - Stop Above Entry', () =>
    {
        // ARRANGE: Long trade with stop loss above entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 2010,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Stop loss must be below entry price for long positions');
    });

    it('Test 13: Invalid Short Trade - Stop Below Entry', () =>
    {
        // ARRANGE: Short trade with stop loss below entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 1950,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Short',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Stop loss must be above entry price for short positions');
    });

    it('Test 14: Zero Risk Amount', () =>
    {
        // ARRANGE: Trade with zero risk amount (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 1990,
            n_riskAmount: 0,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Risk amount is zero or no value has been entered');
    });

    it('Test 15: Negative Price Values', () =>
    {
        // ARRANGE: Trade with negative entry price (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: -2000,
            n_targetPrice: 2050,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('All price values must be positive numbers');
    });

    it('Test 16: Entry Price Equals Stop Loss', () =>
    {
        // ARRANGE: Trade where entry equals stop (no risk defined)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 2000,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Entry price and stop loss cannot be the same');
    });

    it('Test 17: Invalid Long Trade - Target Below Entry', () =>
    {
        // ARRANGE: Long trade with target below entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 1950,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Target price must be above entry price for long positions');
    });

    it('Test 18: Invalid Short Trade - Target Above Entry', () =>
    {
        // ARRANGE: Short trade with target above entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 2010,
            n_riskAmount: 150,
            s_direction: 'Short',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Target price must be below entry price for short positions');
    });

    it('Test 19: Invalid Conversion Rate (zero)', () =>
    {
        // ARRANGE: Trade with zero conversion rate (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0 // Invalid - zero rate
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Currency conversion rate must be a positive number');
    });

    it('Test 20: Invalid Conversion Rate (negative)', () =>
    {
        // ARRANGE: Trade with negative conversion rate (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: -0.79 // Invalid - negative rate
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Currency conversion rate must be a positive number');
    });
});

describe('Position Size Calculator - Edge Cases', () =>
{
    it('Test 21: Lot Size Rounded to 2 Decimal Places', () =>
    {
        // ARRANGE: Trade that would produce many decimals
        // price_diff = 7, risk_in_usd = 150/0.79 = 189.87
        // lot_size = 189.87 / (7 * 100) = 0.2712... -> 0.27
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1993,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is rounded to 2 decimals
        expect((result as CalculationResult).n_lotSize).toBe(0.27);
    });

    it('Test 22: Position too small - lot size rounds to zero', () =>
    {
        // ARRANGE: Trade with very small risk that rounds lot size to 0
        // This should return an error to prevent NaN in subsequent calculations
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2100,
            n_stopLoss: 1900,
            n_riskAmount: 0.01, // Very small risk
            s_direction: 'Long',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned for lot size rounding to zero
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toContain('lot size rounds to zero');
    });

    it('Test 23: Short position with valid parameters', () =>
    {
        // ARRANGE: Valid short trade
        // Entry: 2000, Stop: 2010, Target: 1970
        // price_diff = 10, risk_in_usd = 150/0.79 = 189.87
        // lot_size = 189.87 / (10 * 100) = 0.19
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 1970,
            n_stopLoss: 2010,
            n_riskAmount: 150,
            s_direction: 'Short',
            s_instrument: 'XAUUSD',
            n_conversionRate: 0.79
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify successful calculation
        expect((result as CalculationResult).n_lotSize).toBe(0.19);
        expect((result as CalculationResult).n_rewardRiskRatio).toBe(3); // 30 / 10 = 3
    });
});
