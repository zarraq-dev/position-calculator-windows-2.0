/**
 * Currency Service - Exchange Rate Fetching
 * Fetches live exchange rates via IPC from the main process
 *
 * The actual API call to Frankfurter (https://www.frankfurter.app/) is made
 * in the main process to avoid CORS/security issues in the renderer.
 *
 * Purpose:
 * - Fetch exchange rates to convert quote currency P&L to account currency (GBP)
 * - Support multiple quote currencies: USD, JPY, CHF
 * - GBP pairs return 1.0 (no conversion needed)
 */

import type { QuoteCurrency } from './types';

/**
 * Fetches exchange rates from the main process via IPC
 * The main process handles the actual API call and caching
 *
 * @returns Promise<Record<string, number>> - Map of currency code to GBP exchange rate
 * @throws Error if IPC call fails or electronAPI is not available
 */
async function fetchExchangeRates(): Promise<Record<string, number>>
{
    // Check if electronAPI is available (running in Electron)
    if (!window.electronAPI?.fetchExchangeRates)
    {
        throw new Error('Exchange rate service not available');
    }

    // Fetch rates from main process via IPC
    return window.electronAPI.fetchExchangeRates();
}

/**
 * Gets the exchange rate for converting a quote currency to GBP
 *
 * @param s_quoteCurrency - The quote currency to convert (USD, JPY, CHF, or GBP)
 * @returns Promise<number> - Exchange rate (how many GBP per 1 unit of quote currency)
 *
 * Examples:
 * - getExchangeRate('GBP') returns 1.0 (no conversion needed)
 * - getExchangeRate('USD') returns ~0.79 (1 USD = 0.79 GBP)
 * - getExchangeRate('JPY') returns ~0.0053 (1 JPY = 0.0053 GBP)
 */
export async function getExchangeRate(s_quoteCurrency: QuoteCurrency): Promise<number>
{
    // GBP doesn't need conversion
    if (s_quoteCurrency === 'GBP')
    {
        return 1.0;
    }

    // Fetch rates and return the requested currency's rate
    const exchangeRates: Record<string, number> = await fetchExchangeRates();

    // Validate that we have the requested rate
    if (!(s_quoteCurrency in exchangeRates))
    {
        throw new Error(`Exchange rate not available for currency: ${s_quoteCurrency}`);
    }

    return exchangeRates[s_quoteCurrency];
}

/**
 * Gets exchange rates for all supported quote currencies
 * Useful for pre-fetching all rates at once
 *
 * @returns Promise<Record<QuoteCurrency, number>> - Map of all quote currencies to their GBP rates
 */
export async function getAllExchangeRates(): Promise<Record<QuoteCurrency, number>>
{
    const exchangeRates: Record<string, number> = await fetchExchangeRates();

    return {
        'GBP': 1.0,
        'USD': exchangeRates['USD'],
        'JPY': exchangeRates['JPY'],
        'CHF': exchangeRates['CHF']
    };
}
