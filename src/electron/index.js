/* eslint global-require: 0 */
/* eslint import/no-extraneous-dependencies: 0 */
const electron = require('electron');

const { app } = electron; // Module to control application life.
const { BrowserWindow } = electron; // Module to create native browser window.
let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 1100, height: 700 });
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
