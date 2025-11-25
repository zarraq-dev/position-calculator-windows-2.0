/**
 * Electron Main Process
 * Creates the main application window and handles app lifecycle
 */

import { app, BrowserWindow } from 'electron';
import * as path from 'path';

/**
 * Creates the main application window
 * Window is resizable by default and uses dark theme
 */
function createWindow(): void
{
    const mainWindow_instance: BrowserWindow = new BrowserWindow({
        width: 420, // Initial window width
        height: 520, // Initial window height
        minWidth: 350, // Minimum window width
        minHeight: 450, // Minimum window height
        resizable: true, // Window is resizable (default, but explicit for clarity)
        backgroundColor: '#1a1a2e', // Dark background color
        autoHideMenuBar: true, // Hide menu bar
        webPreferences: {
            nodeIntegration: false, // Disable node integration for security
            contextIsolation: true // Enable context isolation for security
        }
    });

    // Remove menu bar completely
    mainWindow_instance.setMenu(null);

    // Load the renderer HTML file
    const s_htmlPath: string = path.join(__dirname, '../renderer/index.html'); // Path to HTML file
    mainWindow_instance.loadFile(s_htmlPath);
}

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
