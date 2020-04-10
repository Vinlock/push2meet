const { Menu, BrowserWindow } = require('electron')
const Push2Meet = require('./Push2Meet')
const keys = require('./keys')
const { keybindStore, volumeStore } = require('./state')

const checkMenuItem = (menuItem) => {
  menuItem.menu.items.forEach((item) => {
    if (item.label === menuItem.label) {
      menuItem.checked = true
    } else {
      item.checked = false
    }
  })
}

const createMenu = () => {
  const menuTemplate = [
    {
      label: 'Push2Meet',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      label: 'Options',
      submenu: [
        {
          label: 'Set Keybind',
          submenu: [
            {
              label: 'Command/Windows Key',
              click: (menuItem) => {
                keybindStore.setState((state) => {
                  return keys.COMMAND
                })
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: true,
            },
            {
              label: 'Shift Key',
              click: (menuItem) => {
                keybindStore.setState((state) => {
                  return keys.SHIFT
                })
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: 'Control Key',
              click: (menuItem) => {
                keybindStore.setState((state) => {
                  return keys.CTRL
                })
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: 'Alt Key',
              click: (menuItem) => {
                keybindStore.setState((state) => {
                  return keys.ALT
                })
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
          ],
        },
        {
          label: 'Set Volume',
          submenu: [
            {
              label: '10%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.1')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: true,
            },
            {
              label: '20%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.2')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '30%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.3')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '40%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.4')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '50%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.5')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '60%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.6')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '70%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.7')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '80%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.8')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '90%',
              click: (menuItem) => {
                volumeStore.setState(() => '0.9')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '100%',
              click: (menuItem) => {
                volumeStore.setState(() => '1')
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
          ]
        },
        {
          label: 'Set Opacity',
          submenu: [
            {
              label: '25%',
              click: (menuItem) => {
                BrowserWindow.getFocusedWindow().setOpacity(0.25)
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '50%',
              click: (menuItem) => {
                BrowserWindow.getFocusedWindow().setOpacity(0.5)
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '75%',
              click: (menuItem) => {
                BrowserWindow.getFocusedWindow().setOpacity(0.75)
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: false,
            },
            {
              label: '100%',
              click: (menuItem) => {
                BrowserWindow.getFocusedWindow().setOpacity(1)
                checkMenuItem(menuItem)
              },
              type: 'checkbox',
              checked: true,
            },
          ],
        },
      ],
    },
    { role: 'windowMenu' },
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

module.exports = createMenu
