/**
 * Electron Main Process
 * Creates the main application window and handles app lifecycle
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

/**
 * Creates the main application window
 * Window is resizable by default and uses dark theme
 */
function createWindow(): void
{
    const mainWindow_instance: BrowserWindow = new BrowserWindow({
        width: 290, // Initial window width
        height: 420, // Initial window height (increased for close button)
        minWidth: 270, // Minimum window width
        minHeight: 380, // Minimum window height
        resizable: true, // Window is resizable (default, but explicit for clarity)
        transparent: true, // Enable window transparency
        frame: false, // Remove window frame for custom look
        backgroundColor: '#00000000', // Fully transparent background
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
