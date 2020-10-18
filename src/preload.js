const { remote } = require('electron')
const { Menu, MenuItem } = remote

let rightClickPosition = null
const menu = new Menu()

// Creates a menu for DevTools
menu.append(new MenuItem({
  label: 'Inspect Element', click() {
    remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
  }
}))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  rightClickPosition = { x: e.x, y: e.y }
  menu.popup(remote.getCurrentWindow())
}, false)
