import { h, render } from 'preact'

// Import universal application on client
import { App } from '../app/App.js'

// Inflate preact app
const root = document.getElementById('root')
render(h(App), root, root.firstElementChild)

// More logic in real-life app
console.log("Application initialized")
