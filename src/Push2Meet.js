const util = require('util')
const { EventEmitter } = require('events')
const { BrowserWindow, Notification } = require('electron')
const ioHook = require('iohook')
const keys = require('./keys')

const GOOGLE_MEET_URL = 'https://meet.google.com/'
const MUTE_SOUND = 'https://push2meet.sfo2.digitaloceanspaces.com/mute.mp3'
const UNMUTE_SOUND = 'https://push2meet.sfo2.digitaloceanspaces.com/unmute.mp3'

function Push2Meet(app) {
  this.app = app
  this.ready = false
  this.keybind = keys.COMMAND

  // Register all events
  this.registerEvents()
}

Push2Meet.create = function (app) {
  return new Push2Meet(app)
}

util.inherits(Push2Meet, EventEmitter)

Push2Meet.prototype.run = function (meetCode = '') {
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

  this.webView.webContents.on('dom-ready', () => {
    this.webView.webContents.executeJavaScript(`
      const unmuteSound = new Audio('${UNMUTE_SOUND}')
      const muteSound = new Audio('${MUTE_SOUND}')
      console.log('Page Loaded');
      const muteButton = document.querySelector('[data-tooltip~="microphone"]');
      if (muteButton) {
        muteButton.addEventListener('click', (e) => {
          console.log('event', e);
          if (muteButton.dataset.isMuted === 'true') {
            e.isTrusted ? muteSound.play() : unmuteSound.play();
          } else {
            e.isTrusted ? unmuteSound.play() : muteSound.play();
          }
        })
      }
      const toggleMute = () => {
        if (muteButton) {
          muteButton.click();
          console.log('Browser: mic mute toggled');
        } else {
          console.log('Browser: mic mute toggle failed');
        }
      }
    `).then(async () => {
      console.log('JS Executed')
    }).catch((err) => {
      console.log('ERROR')
      console.error(err)
    })
  })
  this.webView.webContents.openDevTools()
  this.webView.loadURL(`${GOOGLE_MEET_URL}${meetCode}`, {
    userAgent: this.app.userAgentFallback.replace(`Electron/${process.versions.electron}`, ''),
  }).then(async () => {
    await this.webView.webContents.session.clearCache();
    this.ready = true
    this.emit('ready')
  })
}

Push2Meet.prototype.registerEvents = function () {
  this.on('keyholdstart', () => {
    this.toggleMic()
  })
  this.on('keyholdend', () => {
    setTimeout(() => {
      this.toggleMic()
    }, 250)
  })
  this.on('ready', async () => {
    this.webView.setOpacity(1)
    this.registerKeyHoldEvents()
  })
}

Push2Meet.prototype.toggleMic = function () {
  this.webView.webContents.executeJavaScript(`
    toggleMute();
  `).then(() => {
    console.log('toggling')
  }).catch((err) => {
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
