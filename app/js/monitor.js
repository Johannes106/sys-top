const path = require("path")
const osu = require("node-os-utils")
const { cpuUsage } = require("process")
const cpu = osu.cpu
const mem = osu.mem
const proc = osu.proc
const os = osu.os
const { ipcRenderer } = require('electron')

let cpuOverload
let alertFrequency

// get settings & values
ipcRenderer.on('settings:get', (e, settings) => {
  // with + you make sure that the value is a number
  cpuOverload = +settings.cpuOverload
  alertFrequency = +settings.alertFrequency
})


// set interval to run every 2 seconds
setInterval(() => {
  //CPU usage
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%"
    // progressbar
    document.getElementById("cpu-progress").style.width = info + "%"
    if (info >= cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red"
    } else {
      document.getElementById("cpu-progress").style.background = "green"
    }
    // notification
    if(info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: "CPU overload",
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, 'img', 'icon.png'),
      })      
      localStorage.setItem('lastNotify', +new Date())
    }
  })

  //Memory free
  mem.free().then((info) => {
    document.getElementById("memory-free").innerText = calcFreeMemPercent(info['freeMemMb'], info['totalMemMb']) + "%"
  })

  //UPTIME
  document.getElementById("sys-uptime").innerText = secondsToDhms(os.uptime())
}, 2000)

document.getElementById("cpu-model").innerText = cpu.model()

document.getElementById("comp-name").innerText = os.hostname()
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`

// total means that something has to calculated first
mem.info().then((info) => {
  document.getElementById("mem-total").innerText = info.totalMemMb
})


// timestamp: caculate days, hours, mins, sec
function secondsToDhms(seconds) {
  seconds = +seconds
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `days: ${days}, ${hours}:${minutes}:${secs}`
}

// notifications
function notifyUser(options) {
  new Notification(options.title, options)
}

// notification time
function runNotify(frequency) {
  if(localStorage.getItem('lastNotify') === null) {
    // store timestamp
    localStorage.setItem('lastNotify', +new Date())
    return true
  }
  const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
  const now = new Date()
  const diffTime = Math.abs(now - notifyTime)
  const minutesPassed = Math.ceil(diffTime / (1000 * 60))

  if(minutesPassed > frequency) {
    return true
  } else {
    return false
  }
}

//caculate free mem
function calcFreeMemPercent(freeMemMb, totalMemMb) {
  let freeMemPercent = freeMemMb*100/totalMemMb
  return (freeMemPercent.toFixed(2))
}