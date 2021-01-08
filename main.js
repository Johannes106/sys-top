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
    show: isMac ? false : true,
    opacity: 0.95,
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

  // actions on the mainWindow
  mainWindow.on('close',  (e) => {
    if(!app.isQuitting === true) {
      e.preventDefault()
      mainWindow.hide()
    }
    return true;
  })

  // create tray
  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png')
  tray = new Tray(icon)
  // actions on the tray:
  // left-click:
  // Important: it is only the click on the tray (not on the close button)
  tray.on('click', () => {
    console.log(`Window is visible: ${mainWindow.isVisible()}`);
    if(mainWindow.isVisible() === true) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
  // right-click
  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: "Quit", 
        click: () => {
          app.isQuitting = true,
          app.quit()
        } },
    ]);
    tray.setContextMenu(contextMenu);
  
  })
  

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
})

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => mainWindow.send('nav:toggle'),
      }
    ]
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
