import Main from './js/main.js'
window.canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.width > 500 ? canvas.width = 375 : 'do nothing'
canvas.height > 800 ? canvas.height = 667 : 'do nothing'
new Main()
