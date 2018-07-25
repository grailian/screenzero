const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const MouseWindow = require('./mouse.window').MouseWindow;
const appRoot = path.join(__dirname, '..');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
class FriendsWindow {
  constructor(app) {
    if (!app) {
      throw new Error('FriendsWindow must be initialized with an app');
    }
    this.app = app;
    this.window = null;
    this.mouseWindow = null
    this.setEventListeners()
    this.create();
  }

  create() {
    // Create the browser window.
    this.window = new BrowserWindow({
      width: 740,
      height: 1000,
      backgroundColor: '#2e2c29',
      webPreferences: {
        // nodeIntegration: false
      },
    });

    // Load the index.html of the app.
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      this.window.loadURL('http://localhost:3000/index.html');
      this.window.webContents.openDevTools();
    } else {
      this.window.loadURL('file://' + appRoot + '/dist/index.html');
    }

    // Emitted when the window is closed.
    this.window.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.window = null;
    });

    this.app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.window === null) {
        this.window = new FriendsWindow(this.app);
      }
    });
  }

  setEventListeners(){
    ipcMain.on('peerConnected', (event, arg) => {
      this.mouseWindow = new MouseWindow(this.app)
    });

    ipcMain.on('peerDisconnected', (event, arg) => {
      if(this.mouseWindow){
        this.mouseWindow.kill()
        this.mouseWindow = null
      }
    });

    ipcMain.on('mouseMove', (event, arg) => {
      if(this.mouseWindow){
        this.mouseWindow.onMouseMove(event, arg)
      }
    })

    ipcMain.on('mouseClick', (event, arg) => {
      if(this.mouseWindow){
        if(arg.action === 'click'){
          this.mouseWindow.onMouseClick(event, arg)
        } else {
          this.mouseWindow.onMouseUpDown(event, arg)
        }
      }
    })

    ipcMain.on('keyPress', (event, arg) => {
      if(this.mouseWindow){
        this.mouseWindow.onKeyPress(event, arg)
      }
    })
  }
}

module.exports.FriendsWindow = FriendsWindow;
