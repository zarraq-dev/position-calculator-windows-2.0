/**
 * Electron Main Process
 * Creates the main application window and handles app lifecycle
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

/**
 * Frankfurter API response structure
 */
interface FrankfurterResponse
{
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
}

/**
 * Cache for exchange rates (fetched once on app startup)
 * Frankfurter API provides daily rates, so no need for frequent updates
 */
let cachedExchangeRatesToGBP: Record<string, number> | null = null;

/**
 * Fetches exchange rates from Frankfurter API and caches them
 * Called once on app startup - rates are cached for entire session
 */
async function prefetchExchangeRates(): Promise<void>
{
    // Frankfurter API endpoint - fetches latest rates with GBP as base currency
    const s_apiUrl: string = 'https://api.frankfurter.app/latest?from=GBP&to=USD,JPY,CHF';

    try
    {
        // Make HTTP request to Frankfurter API
        const httpResponse: Response = await fetch(s_apiUrl);

        // Check if request was successful
        if (!httpResponse.ok)
        {
            throw new Error(`API request failed with status ${httpResponse.status}`);
        }

        // Parse JSON response
        const frankfurterResponse: FrankfurterResponse = await httpResponse.json();

        // Convert rates: API gives GBP->X, we need X->GBP (inverse)
        // Example: If API returns GBP->USD = 1.27, we need USD->GBP = 1/1.27 = 0.787
        cachedExchangeRatesToGBP =
        {
            'USD': 1 / frankfurterResponse.rates['USD'], // USD to GBP rate
            'JPY': 1 / frankfurterResponse.rates['JPY'], // JPY to GBP rate
            'CHF': 1 / frankfurterResponse.rates['CHF'], // CHF to GBP rate
            'GBP': 1.0 // GBP to GBP is always 1
        };

        console.log('Exchange rates fetched successfully:', cachedExchangeRatesToGBP);
    }
    catch (error)
    {
        // Log error but don't crash - rates will be null
        console.error('Failed to fetch exchange rates on startup:', error);
        // Calculations will fail gracefully with user-friendly error message
    }
}

/**
 * Creates the main application window
 * Window is resizable by default and uses dark theme
 */
function createWindow(): void
{
    const mainWindow_instance: BrowserWindow = new BrowserWindow({
        width: 290, // Initial window width
        height: 475, // Initial window height (increased for Take Profit result)
        minWidth: 270, // Minimum window width
        minHeight: 435, // Minimum window height
        resizable: true, // Window is resizable (default, but explicit for clarity)
        transparent: true, // Enable window transparency
        frame: false, // Remove window frame for custom look
        backgroundColor: '#00000000', // Fully transparent background
        alwaysOnTop: true, // Keep window above all other windows
        autoHideMenuBar: true, // Hide menu bar
        webPreferences: {
            nodeIntegration: false, // Disable node integration for security
            contextIsolation: true, // Enable context isolation for security
            preload: path.join(__dirname, 'preload.js') // Load preload script
        }
    });

    // Remove menu bar completely
    mainWindow_instance.setMenu(null);

    // Load the renderer HTML file
    const s_htmlPath: string = path.join(__dirname, '../renderer/index.html'); // Path to HTML file
    mainWindow_instance.loadFile(s_htmlPath);
}

// Handle close window IPC message from renderer
ipcMain.on('close-window', () =>
{
    const focusedWindow_instance: BrowserWindow | null = BrowserWindow.getFocusedWindow(); // Get currently focused window
    if (focusedWindow_instance)
    {
        focusedWindow_instance.close(); // Close the window
    }
});

/**
 * Handle fetch exchange rates IPC request from renderer
 * Returns cached rates (pre-fetched on app startup)
 */
ipcMain.handle('fetch-exchange-rates', (): Record<string, number> =>
{
    if (cachedExchangeRatesToGBP === null)
    {
        throw new Error('Exchange rates not available. Please restart the application.');
    }

    return cachedExchangeRatesToGBP;
});

// Create window when Electron is ready
app.whenReady().then(async () =>
{
    // Pre-fetch exchange rates on startup (Frankfurter API provides daily rates)
    await prefetchExchangeRates();

    createWindow();

    // On macOS, recreate window when dock icon is clicked and no windows exist
    app.on('activate', () =>
    {
        if (BrowserWindow.getAllWindows().length === 0)
        {
            createWindow();
        }
    });
});

// Quit app when all windows are closed (except on macOS)
app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit();
    }
});
