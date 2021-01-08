const { BrowserWindow } = require('electron')

class mainWindow extends BrowserWindow {
  constructor(file, isDev, isMac) {
    super({
      title: 'SysTop',
      width: isDev ? 800 : 355,
      height: 500,
      icon: './assets/icons/icon.png',
      resizable: isDev ? true : false,
      show: isMac ? false : true,
      opacity: 0.95,
      webPreferences: {
        nodeIntegration: true,
      },
    })
    this.loadFile(file)
    if(isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = mainWindow