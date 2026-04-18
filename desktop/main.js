import { app, BrowserWindow, Menu } from "electron";

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // ❗ removes default navbar
    titleBarStyle: "hidden",
    webPreferences: {
        contextIsolation: true,
        preload: new URL('./preload.js', import.meta.url).pathname
    }
  });

win.loadURL("https://resync-liard.vercel.app/?platform=desktop");
  Menu.setApplicationMenu(null);
}
import { ipcMain } from "electron";

ipcMain.on("minimize", () => win.minimize());

ipcMain.on("maximize", () => {
  win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on("close", () => win.close());


app.whenReady().then(createWindow);