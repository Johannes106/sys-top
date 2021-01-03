const path = require('path')
const osu = require('node-os-utils')
const { cpuUsage } = require('process')
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

// set interval to run every 2 seconds
setInterval(() => {
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerText = info + '%'
  })
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = info + '%'
  })

  document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime())

}, 2000)

document.getElementById('cpu-model').innerText = cpu.model()

document.getElementById('comp-name').innerText = os.hostname()
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`

// total means that something has to calculated first
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = info.totalMemMb
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