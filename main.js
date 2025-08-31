// main.js
import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    // Corregir la ruta del frontend para el ejecutable
    mainWindow.loadFile(path.join(__dirname, "frontend/dist/index.html"));
  } else {
    // Opción de desarrollo
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }
}

async function startBackend() {
  const backendPath = pathToFileURL(
    // Corregir la ruta del backend para el ejecutable
    path.join(__dirname, "backend/src/index.js")
  );
  await import(backendPath.href);
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
