/**
 * Test suite for position size calculation logic
 * Following strict TDD approach - tests written before implementation
 */

import { describe, it, expect } from 'vitest';
import { calculatePosition } from '../src/shared/calculations';
import type { TradeInput, CalculationResult, CalculationError } from '../src/shared/types';

describe('Position Size Calculator - Basic Calculations', () =>
{
    it('Test 1: Basic Long Trade - Position Size', () =>
    {
        // ARRANGE: Set up test data for a standard long trade
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 95,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify position size is correct (500 / |100 - 95| = 100)
        expect((result as CalculationResult).n_positionSize).toBe(100);
    });

    it('Test 2: Basic Long Trade - Reward:Risk Ratio', () =>
    {
        // ARRANGE: Same data as Test 1
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 95,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify reward:risk ratio (|110 - 100| / |100 - 95| = 2)
        expect((result as CalculationResult).n_rewardRiskRatio).toBe(2);
    });

    it('Test 3: Basic Short Trade - Position Size', () =>
    {
        // ARRANGE: Set up test data for a standard short trade
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 90,
            n_stopLoss: 105,
            n_riskAmount: 500,
            s_direction: 'Short'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify position size (500 / |105 - 100| = 100)
        expect((result as CalculationResult).n_positionSize).toBe(100);
    });

    it('Test 4: Basic Short Trade - Reward:Risk Ratio', () =>
    {
        // ARRANGE: Same data as Test 3
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 90,
            n_stopLoss: 105,
            n_riskAmount: 500,
            s_direction: 'Short'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify reward:risk ratio (|100 - 90| / |105 - 100| = 2)
        expect((result as CalculationResult).n_rewardRiskRatio).toBe(2);
    });
});

describe('Position Size Calculator - Edge Cases', () =>
{
    it('Test 5: Tight Stop Loss (Small Risk Per Share)', () =>
    {
        // ARRANGE: Trade with very tight stop loss
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100.50,
            n_targetPrice: 102.00,
            n_stopLoss: 100.00,
            n_riskAmount: 1000,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify position size (1000 / 0.50 = 2000)
        expect((result as CalculationResult).n_positionSize).toBe(2000);
    });

    it('Test 6: Large Numbers (High-Priced Assets - BTC)', () =>
    {
        // ARRANGE: Bitcoin trade with 7-digit prices
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 1000000,
            n_targetPrice: 1100000,
            n_stopLoss: 950000,
            n_riskAmount: 10000,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify position size (10000 / 50000 = 0.2)
        expect((result as CalculationResult).n_positionSize).toBe(0.2);
    });

    it('Test 7: Decimal Precision (Crypto with 9 decimals)', () =>
    {
        // ARRANGE: Crypto asset with 9 decimal places
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 1.234567890,
            n_targetPrice: 1.434567890,
            n_stopLoss: 1.134567890,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify position size with 9 decimal preservation (500 / 0.1 = 5000)
        expect((result as CalculationResult).n_positionSize).toBe(5000);
    });

    it('Test 8: Very Small Reward:Risk Ratio', () =>
    {
        // ARRANGE: Unfavorable trade setup with poor reward:risk
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 102,
            n_stopLoss: 90,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify low reward:risk ratio (2 / 10 = 0.2)
        expect((result as CalculationResult).n_rewardRiskRatio).toBe(0.2);
    });
});

describe('Position Size Calculator - Validation Tests', () =>
{
    it('Test 9: Invalid Long Trade - Stop Above Entry', () =>
    {
        // ARRANGE: Long trade with stop loss above entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 105,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Stop loss must be below entry price for long positions');
    });

    it('Test 10: Invalid Short Trade - Stop Below Entry', () =>
    {
        // ARRANGE: Short trade with stop loss below entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 90,
            n_stopLoss: 95,
            n_riskAmount: 500,
            s_direction: 'Short'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Stop loss must be above entry price for short positions');
    });

    it('Test 11: Zero Risk Amount', () =>
    {
        // ARRANGE: Trade with zero risk amount (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 95,
            n_riskAmount: 0,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Risk amount is zero or no value has been entered');
    });

    it('Test 12: Negative Price Values', () =>
    {
        // ARRANGE: Trade with negative entry price (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: -100,
            n_targetPrice: 110,
            n_stopLoss: 95,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('All price values must be positive numbers');
    });

    it('Test 13: Entry Price Equals Stop Loss', () =>
    {
        // ARRANGE: Trade where entry equals stop (no risk defined)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 100,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Entry price and stop loss cannot be the same');
    });

    it('Test 14: Invalid Long Trade - Target Below Entry', () =>
    {
        // ARRANGE: Long trade with target below entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 95,
            n_stopLoss: 90,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Target price must be above entry price for long positions');
    });

    it('Test 15: Invalid Short Trade - Target Above Entry', () =>
    {
        // ARRANGE: Short trade with target above entry (invalid)
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 105,
            n_riskAmount: 500,
            s_direction: 'Short'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify error returned
        expect((result as CalculationError).b_error).toBe(true);
        expect((result as CalculationError).s_message).toBe('Target price must be below entry price for short positions');
    });
});

describe('Position Size Calculator - Additional Outputs', () =>
{
    it('Test 16: Potential Profit Calculation', () =>
    {
        // ARRANGE: Same data as Test 1
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 95,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify potential profit (100 shares × |110 - 100| = 1000)
        expect((result as CalculationResult).n_potentialProfit).toBe(1000);
    });

    it('Test 17: Potential Loss Display', () =>
    {
        // ARRANGE: Same data as Test 1
        const tradeInput_data: TradeInput =
        {
            n_entryPrice: 100,
            n_targetPrice: 110,
            n_stopLoss: 95,
            n_riskAmount: 500,
            s_direction: 'Long'
        };

        // ACT: Calculate position
        const result = calculatePosition(tradeInput_data);

        // ASSERT: Verify potential loss equals risk amount
        expect((result as CalculationResult).n_potentialLoss).toBe(500);
    });
});
