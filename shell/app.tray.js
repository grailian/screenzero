const electron = require('electron');
const { BrowserWindow } = require('electron');
const path = require('path');
const Tray = electron.Tray;
const Menu = electron.Menu;

class AppTray {
  constructor() {
    this.tray = new Tray(path.join(__dirname, './icon.png'));
    // const contextMenu = Menu.buildFromTemplate([
    //   { label: 'Item1', type: 'radio' },
    //   { label: 'Item2', type: 'radio' },
    //   { label: 'Item3', type: 'radio', checked: true },
    //   { label: 'Item4', type: 'radio' },
    // ]);
    // this.tray.setToolTip('This is my application.');
    // this.tray.setContextMenu(contextMenu);

    // Add a click handler so that when the user clicks on the menubar icon, it shows
    // our popup window
    this.tray.on('click', (event) => {
      this.toggleWindow();

      // Show devtools when command clicked
      if (this.window.isVisible() && process.defaultApp && event.metaKey) {
        this.window.openDevTools({ mode: 'detach' });
      }
    });

    // Make the popup window for the menubar
    this.window = new BrowserWindow({
      width: 300,
      height: 350,
      show: false,
      frame: false,
      resizable: false,
    });

    // Tell the popup window to load our index.html file
    // this.window.loadURL(`file://${path.join(__dirname, 'index.html')}`);
    this.window.loadURL('http://localhost:3000/index.html');

    // Only close the window on blur if dev tools isn't opened
    this.window.on('blur', () => {
      if (!this.window.webContents.isDevToolsOpened()) {
        this.window.hide();
      }
    });
  }

  toggleWindow() {
    if (this.window.isVisible()) {
      this.window.hide();
    } else {
      this.showWindow();
    }
  };

  showWindow() {
    const trayPos = this.tray.getBounds();
    const windowPos = this.window.getBounds();
    let x, y = 0;
    if (process.platform === 'darwin') {
      x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
      y = Math.round(trayPos.y + trayPos.height);
    } else {
      x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
      y = Math.round(trayPos.y + trayPos.height * 10);
    }

    this.window.setPosition(x, y, false);
    this.window.show();
    this.window.focus();
  };
}

module.exports.AppTray = AppTray;
