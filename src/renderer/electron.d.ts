/**
 * TypeScript declaration for Electron API exposed via preload
 */

export interface ElectronAPI
{
    closeWindow: () => void; // Function to close the application window
    fetchExchangeRates: () => Promise<Record<string, number>>; // Function to fetch exchange rates from main process
}

declare global
{
    interface Window
    {
        electronAPI?: ElectronAPI; // Electron API exposed to renderer (optional for test environment)
    }
}
