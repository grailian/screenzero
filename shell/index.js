const electron = require('electron');
const app = electron.app;

const packageDetails = require('../package.json');
require('./mouse.ipc');
const FriendsWindow = require('./friends.window').FriendsWindow;
const AppTray = require('./app.tray').AppTray;

// ------------------------------------
// Set Application Values Globally for React App
// ------------------------------------
global.configPath = app.getPath('userData');
global.appVersion = packageDetails.version;

// ------------------------------------
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// ------------------------------------
app.on('ready', () => {
  new FriendsWindow(app);
  // new AppTray();
});

// ------------------------------------
// Quit when all windows are closed.
// ------------------------------------
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
