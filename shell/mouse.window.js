const { BrowserWindow } = require('electron');
const path = require('path');
const appRoot = path.join(__dirname, '..');

// ------------------------------------
// https://electronjs.org/docs/api/frameless-window
// ------------------------------------

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
class MouseWindow {
  constructor(app) {
    if (!app) {
      throw new Error('MouseWindow must be initialized with an app');
    }
    this.app = app;
    this.window = null;
    this.demoCount = 0;
    return this.create();
  }

  create() {
    // Create the browser window.
    this.window = new BrowserWindow({
      frame: false,
      resizable: false,
      width: 25,
      height: 25,
      // backgroundColor: 'transparent',
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
      },
    });

    this.window.setIgnoreMouseEvents(true);

    this.window.loadURL('file://' + appRoot + '/shell/mouse.html');

    this.moveMouse(...this.window.getPosition());
    return this;
  }

  moveMouse(x, y) {
    this.window.setPosition(x, y);

    // TODO: kill this demo stuff
    setTimeout(() => {
      const [x, y] = this.window.getPosition();
      this.demoCount += 1;
      if (this.demoCount < 5) {
        this.moveMouse(x + 10, y + 10);
      } else {
        this.kill();
      }
    }, 1000);
  }

  kill() {
    this.window.close();
    this.window = null;
  }
}

module.exports.MouseWindow = MouseWindow;
