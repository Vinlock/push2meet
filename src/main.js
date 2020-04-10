const { app, BrowserWindow } = require('electron')
const Push2Meet = require('./Push2Meet')
const createMenu = require('./menu')
const keys = require('./keys')

app.name = 'Push2Meet'
app.keybind = keys.COMMAND
createMenu(app)

app.whenReady().then(() => {
  const meet = Push2Meet.create(app)
  meet.run()
})

// // Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    const meet = Push2Meet.create(app)
    meet.run()
  }
})