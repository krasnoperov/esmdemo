// @flow

// Universal application code both for server and client
import { h } from 'preact'

// On client: class names are provided by rollup
// On server: class names are taken from build/static/classnames.json assets by module loader
import styles from './App.css'

// On client: url is provided by rollup
// On server: url is taken from build/static/static.json assets by module loader
import image from './images/nodejs-icon.svg'

// Type declaration must be stripped from code before execution
// type Props = {}

export function App() {
  return (
    h('div', { className: styles.app },
      h('h1', {className: styles.header}, 'Header'),
      h('p', {className: styles.content}, 'Content'),
      h('img', {className: styles.img, src: image, width: 100, height: 100, alt:'Logo'}),
      h('img', {className: styles.svgimg, src: image, width: 100, height: 100, alt:'Logo'}),
    )
  )

  // In real-life application here will be much more logic
}
