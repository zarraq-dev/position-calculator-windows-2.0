/**
 * Test suite for position size calculation logic
 * Following strict TDD approach - tests written before implementation
 *
 * Core Formulas:
 * 1. price_diff = |stop_loss_price - entry_price|
 * 2. lot_size = risk_amount / (price_diff * contract_size)
 * 3. quantity = lot_size * contract_size
 * 4. risk = price_diff * quantity
 * 5. reward = |take_profit_price - entry_price| * quantity
 * 6. risk_reward_ratio = reward / risk
 *
 * Instrument Contract Sizes:
 * - EURUSD: 100000
 * - XAUUSD: 100
 * - XAGUSD: 5000
 * - WTI: 100
 * - UKOIL: 100
 */

import { describe, it, expect } from 'vitest';
import { calculatePosition } from '../src/shared/calculations';
import type { TradeInput, CalculationResult, CalculationError } from '../src/shared/types';

describe('Position Size Calculator - Basic Calculations (XAUUSD)', () =>
{
    it('Test 1: XAUUSD Long Trade - Lot Size', () =>
    {
        // ARRANGE: XAUUSD trade (contract_size = 100)
        // Entry: 2000, Stop: 1990, price_diff = 10
        // lot_size = 150 / (10 * 100) = 0.15
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 0.15
        expect((result as CalculationResult).n_lotSize).toBe(0.15);
    });

    it('Test 2: XAUUSD Long Trade - Quantity', () =>
    {
        // ARRANGE: Same as Test 1
        // quantity = lot_size * contract_size = 0.15 * 100 = 15
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify quantity is 15
        expect((result as CalculationResult).n_quantity).toBe(15);
    });

    it('Test 3: XAUUSD Long Trade - Risk', () =>
    {
        // ARRANGE: Same as Test 1
        // risk = price_diff * quantity = 10 * 15 = 150
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify risk matches input risk amount
        expect((result as CalculationResult).n_risk).toBe(150);
    });

    it('Test 4: XAUUSD Long Trade - Reward', () =>
    {
        // ARRANGE: Same as Test 1
        // reward_price_diff = |2030 - 2000| = 30
        // reward = 30 * 15 = 450
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify reward is 450
        expect((result as CalculationResult).n_reward).toBe(450);
    });

    it('Test 5: XAUUSD Long Trade - Reward:Risk Ratio', () =>
    {
        // ARRANGE: Same as Test 1
        // risk_reward_ratio = reward / risk = 450 / 150 = 3
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify reward:risk ratio is 3
        expect((result as CalculationResult).n_rewardRiskRatio).toBe(3);
    });
});

describe('Position Size Calculator - Different Instruments', () =>
{
    it('Test 6: EURUSD Trade - Lot Size (contract_size = 100000)', () =>
    {
        // ARRANGE: EURUSD trade
        // Entry: 1.1000, Stop: 1.0990, price_diff = 0.001
        // lot_size = 100 / (0.001 * 100000) = 1.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 1.1000,
            n_targetPrice: 1.1030,
            n_stopLoss: 1.0990,
            n_riskAmount: 100,
            s_direction: 'Long',
            s_instrument: 'EURUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 1.0
        expect((result as CalculationResult).n_lotSize).toBe(1);
    });

    it('Test 7: XAGUSD Trade - Lot Size (contract_size = 5000)', () =>
    {
        // ARRANGE: XAGUSD (silver) trade
        // Entry: 25.00, Stop: 24.90, price_diff = 0.10
        // lot_size = 500 / (0.10 * 5000) = 1.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 25.00,
            n_targetPrice: 25.30,
            n_stopLoss: 24.90,
            n_riskAmount: 500,
            s_direction: 'Long',
            s_instrument: 'XAGUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 1.0
        expect((result as CalculationResult).n_lotSize).toBe(1);
    });

    it('Test 8: WTI Trade - Lot Size (contract_size = 100)', () =>
    {
        // ARRANGE: WTI (crude oil) trade
        // Entry: 70.00, Stop: 69.00, price_diff = 1.0
        // lot_size = 200 / (1.0 * 100) = 2.0
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 70.00,
            n_targetPrice: 73.00,
            n_stopLoss: 69.00,
            n_riskAmount: 200,
            s_direction: 'Long',
            s_instrument: 'WTI'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 2.0
        expect((result as CalculationResult).n_lotSize).toBe(2);
    });

    it('Test 9: UKOIL Trade - Short Position', () =>
    {
        // ARRANGE: UKOIL (Brent) short trade
        // Entry: 75.00, Stop: 76.00, price_diff = 1.0
        // lot_size = 150 / (1.0 * 100) = 1.5
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 75.00,
            n_targetPrice: 72.00,
            n_stopLoss: 76.00,
            n_riskAmount: 150,
            s_direction: 'Short',
            s_instrument: 'UKOIL'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is 1.5
        expect((result as CalculationResult).n_lotSize).toBe(1.5);
    });
});

describe('Position Size Calculator - Validation Tests', () =>
{
    it('Test 10: Invalid Long Trade - Stop Above Entry', () =>
    {
        // ARRANGE: Long trade with stop loss above entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 2010,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Stop loss must be below entry price for long positions');
    });

    it('Test 11: Invalid Short Trade - Stop Below Entry', () =>
    {
        // ARRANGE: Short trade with stop loss below entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 1950,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Short',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Stop loss must be above entry price for short positions');
    });

    it('Test 12: Zero Risk Amount', () =>
    {
        // ARRANGE: Trade with zero risk amount (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 1990,
            n_riskAmount: 0,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Risk amount is zero or no value has been entered');
    });

    it('Test 13: Negative Price Values', () =>
    {
        // ARRANGE: Trade with negative entry price (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: -2000,
            n_targetPrice: 2050,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('All price values must be positive numbers');
    });

    it('Test 14: Entry Price Equals Stop Loss', () =>
    {
        // ARRANGE: Trade where entry equals stop (no risk defined)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 2000,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Entry price and stop loss cannot be the same');
    });

    it('Test 15: Invalid Long Trade - Target Below Entry', () =>
    {
        // ARRANGE: Long trade with target below entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 1950,
            n_stopLoss: 1990,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Target price must be above entry price for long positions');
    });

    it('Test 16: Invalid Short Trade - Target Above Entry', () =>
    {
        // ARRANGE: Short trade with target above entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2050,
            n_stopLoss: 2010,
            n_riskAmount: 150,
            s_direction: 'Short',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Target price must be below entry price for short positions');
    });
});

describe('Position Size Calculator - Rounding Tests', () =>
{
    it('Test 17: Lot Size Rounded to 2 Decimal Places', () =>
    {
        // ARRANGE: Trade that would produce many decimals
        // price_diff = 7, lot_size = 150 / (7 * 100) = 0.2142857...
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 2000,
            n_targetPrice: 2030,
            n_stopLoss: 1993,
            n_riskAmount: 150,
            s_direction: 'Long',
            s_instrument: 'XAUUSD'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify lot size is rounded to 2 decimals (0.21)
        expect((result as CalculationResult).n_lotSize).toBe(0.21);
    });
});
