const { createSharedStore } = require('electron-shared-state')
const keys = require('./keys')

const keybindStore = createSharedStore(keys.SHIFT)
const volumeStore = createSharedStore('0.1')

module.exports = {
  keybindStore,
  volumeStore,
}
