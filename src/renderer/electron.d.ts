/**
 * TypeScript declaration for Electron API exposed via preload
 */

export interface ElectronAPI
{
    closeWindow: () => void; // Function to close the application window
}

declare global
{
    interface Window
    {
        electronAPI: ElectronAPI; // Electron API exposed to renderer
    }
}
