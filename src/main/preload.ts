/**
 * Preload Script
 * Exposes safe IPC methods to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer via window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: (): void =>
    {
        ipcRenderer.send('close-window'); // Send close message to main process
    },
    fetchExchangeRates: (): Promise<Record<string, number>> =>
    {
        return ipcRenderer.invoke('fetch-exchange-rates'); // Fetch exchange rates from main process
    }
});
