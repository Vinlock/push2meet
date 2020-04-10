const { createSharedStore } = require('electron-shared-state')
const keys = require('./keys')

const keybindStore = createSharedStore(keys.SHIFT)

module.exports = {
  keybindStore,
}
