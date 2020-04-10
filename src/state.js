const { createSharedStore } = require('electron-shared-state')
const keys = require('./keys')

const keybindStore = createSharedStore(keys.COMMAND)

module.exports = {
  keybindStore,
}
