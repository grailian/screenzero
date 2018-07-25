const { BrowserWindow } = require('electron');
const path = require('path');
const robot = require('robotjs');
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
    this.lastPos = robot.getMousePos();
    this.currentMouseAction = 'up'
    this.create();
  }

  create() {
    // Create the browser window.
    this.window = new BrowserWindow({
      frame: false,
      resizable: false,
      width: 25,
      height: 25,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
      },
    });

    this.window.setIgnoreMouseEvents(true);

    this.window.loadURL('file://' + appRoot + '/shell/mouse.html');

    this.setOnTop()
  }

  setOnTop(){
    if(this.window){
      this.window.setAlwaysOnTop(true)
      setTimeout(() => {
        this.setOnTop()
      }, 5000)
    }
  }

  onMouseMove(event, arg){
    // console.log('received mouse move', arg);
    if(this.currentMouseAction === 'down'){
      robot.dragMouse(arg.x, arg.y)
    }
    this.moveSimMouse(arg.x, arg.y)
  }

  onMouseClick(event, arg){
    // console.log('received mouse click', arg);
    this.currentMouseAction = 'up'
    this.lastPos = robot.getMousePos();
    robot.moveMouse(arg.x, arg.y);
    robot.mouseClick(arg.button || 'left')
    // robot.moveMouse(this.lastPos.x, this.lastPos.y);
  }

  onMouseUpDown(event, arg){
    // console.log('received mouse click', arg);
    this.currentMouseAction = arg.action
    if(arg.action === 'down'){
      this.lastPos = robot.getMousePos();
    }

    robot.mouseToggle(arg.action, arg.button || 'left');

    /*if(arg.action === 'up'){
      robot.moveMouse(this.lastPos.x, this.lastPos.y);
    }*/
  }

  onKeyPress(event, arg){
    console.log('keypress', arg)
    robot.keyTap(arg.keyCode, arg.modifiers)
  }

  moveSimMouse(x, y) {
    this.window.setPosition(Math.floor(x), Math.floor(y));
  }

  kill() {
    this.window.close();
    this.window = null;
  }
}

module.exports.MouseWindow = MouseWindow;
