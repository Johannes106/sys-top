const { app, BrowserWindow, Menu, ipcMain, Tray } = require('electron')
const log = require('electron-log')
const path = require('path')
const Store = require('./Store')

// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow
let tray

// Init store
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
})

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'SysTop',
    width: isDev ? 800 : 355,
    height: 500,
    icon: './assets/icons/icon.png',
    resizable: isDev ? true : false,
    show: true,
    opacity: 0.9,
    webPreferences: {
      nodeIntegration: true,
    },
  })


  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile('./app/index.html')
}

app.on('ready', () => {
  createMainWindow()

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'))
  }) 


  // create tray
  // const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png')
  // tray = new Tray(icon)
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Item1', type: 'radio' },
  //   { label: 'Item2', type: 'radio' },
  //   { label: 'Item3', type: 'radio', checked: true },
  //   { label: 'Item4', type: 'radio' }
  // ])
  // tray.setContextMenu(contextMenu)
  // tray.on('click', () => {
  //   if(mainWindow.isVisible() === true) {
  //     mainWindow.hide()
  //   } else {
  //     mainWindow.show()
  //     tray.setToolTip('This is my application.')
  //   }
  // })


  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
})

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
]

// set settings
ipcMain.on('settings:set', (e, value) => {
  store.set('settings', value)
  // get current value and set it
  mainWindow.webContents.send("settings:get", store.get('settings'))
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.allowRendererProcessReuse = true
