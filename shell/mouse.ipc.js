const electron = require('electron');
const ipcMain = electron.ipcMain;
const robot = require('robotjs');

ipcMain.on('mouseClick', (event, arg) => {
  console.log('received Mouseclick', arg);
  let curPos = robot.getMousePos();
  robot.moveMouse(arg.x, arg.y);
  robot.mouseClick(arg.button || 'left');
  setTimeout(() => {
    // robot.moveMouse(curPos.x, curPos.y);
  }, 50);
});
