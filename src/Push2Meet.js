const util = require('util')
const { EventEmitter } = require('events')
const { BrowserWindow, Notification } = require('electron')
const ioHook = require('iohook')
const { keybindStore, volumeStore } = require('./state')
const keys = require('./keys')

global.keybind = keys.COMMAND

const GOOGLE_MEET_URL = 'https://meet.google.com/'
const MUTE_SOUND = 'https://push2meet.sfo2.digitaloceanspaces.com/mute.mp3'
const UNMUTE_SOUND = 'https://push2meet.sfo2.digitaloceanspaces.com/unmute.mp3'

function Push2Meet(app) {
  this.app = app
  this.ready = false
  this.keybind = keys.SHIFT

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
      const getMuteButton = () => {
        return document.querySelector('[data-tooltip="Turn off microphone (⌘ + d)"]')
          || document.querySelector('[data-tooltip="Turn on microphone (⌘ + d)"]');
      }
      const unmuteSound = new Audio('${UNMUTE_SOUND}');
      unmuteSound.volume = 0.1;
      const muteSound = new Audio('${MUTE_SOUND}');
      muteSound.volume = 0.1;
      let muteButton = null;
      
      const observer = new MutationObserver((mutationList) => {
        console.log('mutationList', mutationList);
        if (muteButton && document.body.contains(muteButton)) {
          console.log('old still here');
        } else if (document.body.contains(getMuteButton())) {
          console.log('resetting');
          muteButton = getMuteButton();
          console.log('reset mute button', muteButton);
          muteButton.addEventListener('click', (event) => {
            console.log('event', event);
            console.log('isMuted', muteButton.dataset.isMuted);
            if (muteButton.dataset.isMuted === 'true') {
              event.isTrusted ? muteSound.play() : unmuteSound.play();
            } else {
              event.isTrusted ? unmuteSound.play() : muteSound.play();
            }
          })
        }
      })
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    
      console.log('Page Loaded');
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
      keybindStore.subscribe((keybind) => {
        this.emit('keybindupdate', keybind)
      })
      volumeStore.subscribe((volume) => {
        this.emit('volumeupdate', volume)
      })
    }).catch((err) => {
      console.log('ERROR')
      console.error(err)
    })
  })
  // this.webView.webContents.openDevTools()
  this.webView.loadURL(`${GOOGLE_MEET_URL}${meetCode}`, {
    userAgent: this.app.userAgentFallback.replace(`Electron/${process.versions.electron}`, ''),
  }).then(async () => {
    await this.webView.webContents.session.clearCache();
    this.ready = true
    this.emit('ready')
  })
}

Push2Meet.prototype.registerEvents = function () {
  const keyHoldStartHandler = () => {
    this.toggleMic()
  }
  const keyHoldEndHandler = () => {
    setTimeout(() => {
      this.toggleMic()
    }, 250)
  }
  const readyHandler = () => {
    this.webView.setOpacity(1)
    this._registerKeyHoldEvents()
    ioHook.start()
  }
  const keyBindUpdateHandler = (keybind) => {
    this.keybind = keybind
  }
  const volumeUpdateHandler = (volume) => {
    this.updateVolume(volume)
  }

  this.on('keyholdstart', keyHoldStartHandler)
  this.on('keyholdend', keyHoldEndHandler)
  this.on('ready', readyHandler)
  this.on('keybindupdate', keyBindUpdateHandler)
  this.on('volumeupdate', volumeUpdateHandler)
}

Push2Meet.prototype.toggleMic = function () {
  this.webView.webContents.executeJavaScript(`
    toggleMute();
  `).catch((err) => {
    console.error('error', err)
  })
}

Push2Meet.prototype.updateVolume = function (volume) {
  this.webView.webContents.executeJavaScript(`
    if (unmuteSound) {
      unmuteSound.volume = ${volume};
    }
    if (muteSound) {
      muteSound.volume = ${volume};
    }
  `).catch((err) => {
    console.log('VOLUME ERROR')
    console.error(err)
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

Push2Meet.prototype._keyWasPressed = function (event) {
  return !Object.keys(this.keybind).some((eventKey) => {
    const eventValue = event[eventKey]
    const validValue = this.keybind[eventKey]
    return eventValue !== validValue
  })
}

Push2Meet.prototype._handleKeyDownEvent = function (event) {
  const isValidEvent = this._keyWasPressed(event)
  if (isValidEvent) {
    this.emit('keyholdstart')
  }
}

Push2Meet.prototype._handleKeyUpEvent = function (event) {
  const isValidEvent = this._keyWasPressed(event)
  if (isValidEvent) {
    this.emit('keyholdend')
  }
}

Push2Meet.prototype._registerKeyHoldEvents = function () {
  const keyDownHandler = this._handleKeyDownEvent.bind(this)
  const keyUpHandler = this._handleKeyUpEvent.bind(this)
  ioHook.addListener('keydown', keyDownHandler)
  ioHook.addListener('keyup', keyUpHandler)
}

module.exports = Push2Meet
