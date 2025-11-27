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
 * Cache for exchange rates to avoid excessive API calls
 */
let cachedExchangeRatesToGBP: Record<string, number> | null = null;
let n_cacheTimestamp: number = 0;
const N_CACHE_DURATION_MS: number = 15 * 60 * 1000; // 15 minutes

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
 * Fetches rates from Frankfurter API and returns them to renderer
 */
ipcMain.handle('fetch-exchange-rates', async (): Promise<Record<string, number>> =>
{
    // Check if cache is still valid
    const n_currentTime: number = Date.now();
    if (cachedExchangeRatesToGBP !== null && (n_currentTime - n_cacheTimestamp) < N_CACHE_DURATION_MS)
    {
        return cachedExchangeRatesToGBP;
    }

    // Frankfurter API endpoint
    const s_apiUrl: string = 'https://api.frankfurter.app/latest?from=GBP&to=USD,JPY,CHF';

    try
    {
        // Use Node.js fetch (available in Electron's main process)
        const httpResponse: Response = await fetch(s_apiUrl);

        if (!httpResponse.ok)
        {
            throw new Error(`API request failed with status ${httpResponse.status}`);
        }

        const frankfurterResponse: FrankfurterResponse = await httpResponse.json();

        // Convert rates: API gives GBP->X, we need X->GBP
        const exchangeRatesToGBP: Record<string, number> =
        {
            'USD': 1 / frankfurterResponse.rates['USD'],
            'JPY': 1 / frankfurterResponse.rates['JPY'],
            'CHF': 1 / frankfurterResponse.rates['CHF'],
            'GBP': 1.0
        };

        // Update cache
        cachedExchangeRatesToGBP = exchangeRatesToGBP;
        n_cacheTimestamp = n_currentTime;

        return exchangeRatesToGBP;
    }
    catch (error)
    {
        // If API fails and we have cached rates, use them
        if (cachedExchangeRatesToGBP !== null)
        {
            console.warn('Failed to fetch fresh rates, using cached rates:', error);
            return cachedExchangeRatesToGBP;
        }

        throw new Error(`Failed to fetch exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});

// Create window when Electron is ready
app.whenReady().then(() =>
{
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
