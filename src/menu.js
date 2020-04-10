const { Menu, BrowserWindow } = require('electron')
const Push2Meet = require('./Push2Meet')

const checkMenuItem = (menuItem) => {
  menuItem.menu.items.forEach((item) => {
    if (item.label === menuItem.label) {
      menuItem.checked = true
    } else {
      item.checked = false
    }
  })
}

const createMenu = (app) => {
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
      label: 'File',
      submenu: [
        {
          label: 'New Meet Window',
          click: () => {
            const meet = Push2Meet.create(app)
            meet.run()
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
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
