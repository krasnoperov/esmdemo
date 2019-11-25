import { h } from 'preact'
import render from 'preact-render-to-string'
import { loadAssetsMeta } from './loadAssetsMeta.js'

// Import universal application on server
import { App } from '../app/App.js'

// Assets must be built before import of this module both in development and production environments
const entrypoint = loadAssetsMeta('build/static/entrypoint.json')

const styles = loadAssetsMeta('build/static/styles.json')

/**
 * Render HTML page
 */
export default async function (req, res) {
  try {

    // Handle page location and fetch required data in real-life app

    res.writeHead(200, { 'Content-Type': 'text/html' })

    // Render HTML head with correct import of styles
    res.write(
      `<!doctype html>
  <html lang="en-us">
  <head>
  <meta charSet="utf-8">
  <title>Sample</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${styles['index.js'].map(style => `<link href="/static/${style}" media="all" rel="stylesheet" type="text/css">`).join('')}
  </head>
  <body>
    <div id="root">`)

    // Render main application with some complex logic
    res.write(render(
      h(App),
    ))

    // Render HTML head with correct import of scripts
    res.write(`
    </div>
    <script type="module" src="/static/${entrypoint['index.js'].fileName}" crossorigin="anonymous"></script>
    </body>
</html>`)

    res.end()
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message || err)
  }
}
