const util = require('util')
const { EventEmitter } = require('events')
const { BrowserWindow, Notification } = require('electron')
const ioHook = require('iohook')
const keys = require('./keys')

const GOOGLE_MEET_URL = 'https://meet.google.com'

function Push2Meet(app) {
  this.ready = false
  this.keybind = keys.COMMAND

  // Register all events
  this.registerEvents()

  // Instantiate Browser Window and load Google Meet
  this.webView = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    },
    opacity: 0,
  })
  this.webView.loadURL(GOOGLE_MEET_URL, {
    userAgent: app.userAgentFallback.replace(`Electron/${process.versions.electron}`, ''),
  }).then(() => {
    this.ready = true
    this.emit('ready')
  })
}

Push2Meet.create = function (app) {
  return new Push2Meet(app)
}

util.inherits(Push2Meet, EventEmitter)

Push2Meet.prototype.registerEvents = function () {
  this.on('keyholdstart', () => {
    this.toggleMic()
  })
  this.on('keyholdend', () => {
    setTimeout(() => {
      this.toggleMic()
    }, 200)
  })
  this.on('ready', async () => {
    this.webView.setOpacity(1)
    this.webView.webContents.openDevTools()
    this.registerKeyHoldEvents()
    this.webView.webContents.on('dom-ready', () => {
      this.webView.webContents.executeJavaScript(`
      const toggleMute = () => {
        const muteButton = document.querySelector('[data-tooltip~="microphone"]');
        console.log('muteButton', muteButton);
        if (muteButton) {
          muteButton.click();
          console.log('Browser: mic mute toggled');
        } else {
          console.log('Browser: mic mute toggle failed');
        }
      }
    `).then(async () => {
        console.log('JS Executed')
      })
    })
  })
}

Push2Meet.prototype.toggleMic = function () {
  this.webView.webContents.executeJavaScript(`
    toggleMute();
  `).then(() => {
    console.log('App: mic mute toggled');
    this.notify('Mic mute toggled.', 3000)
  }).catch((err) => {
    console.log('ERROR HAPPENED')
    console.error('error', err)
  })
}

Push2Meet.prototype.notify = function (content, timeout = 1000) {
  const notification = new Notification({
    title: 'Push2Meet',
    body: content,
  })
  setTimeout(() => {
    notification.close()
  }, timeout)
  notification.show()
}

Push2Meet.prototype.registerKeyHoldEvents = function () {
  ioHook.on('keydown', (event) => {
    const isValidEvent = eventIsKey(event, this.keybind)
    if (isValidEvent) {
      this.emit('keyholdstart')
    }
  })

  ioHook.on('keyup', (event) => {
    const isValidEvent = eventIsKey(event, this.keybind)
    if (isValidEvent) {
      this.emit('keyholdend')
    }
  })

  ioHook.start()
}

const eventIsKey = (event, key) => {
  return !Object.keys(key).some((eventKey) => {
    const eventValue = event[eventKey]
    const validValue = key[eventKey]
    return eventValue !== validValue
  })
}

module.exports = Push2Meet
