import fs from 'fs'
import path from 'path'
import Express from 'express'
import http from 'http'
import serveStatic from 'serve-static'
import applyCJSLoader from './cjsloader.js'
import { BASE_PATH } from './loadAssetsMeta.js'

async function main () {

  const app = new Express()
  app.use('/static/', serveStatic(path.join(BASE_PATH, 'build/static/')))

  if (process.env.NODE_ENV === 'production') {
    // In Production client side bundle and static assets must be already built

    // Allow import of images and css styles
    applyCJSLoader()

    // Require page handler after setup of import resolver
    app.use((await import('./renderPage.js')).default)

  } else {

    // In Development run rollup to build client side bundle and static assets
    const { watch } = (await import('rollup'))
    const rollupConfig = (await import ('../rollup.config.js')).default

    watch(rollupConfig).on('event', event => {
      if (event.code === 'END') {

        // Remove nodejs require cache, so modules can be required once again
        Object.keys(require.cache)
          .filter(id => /\/(app|build|backend|frontend)\//.test(id))
          .forEach(id => delete require.cache[id])

        // Refresh info about images and css styles
        applyCJSLoader()
      } else if (event.code === 'ERROR' || event.code === 'FATAL') {
        console.error(event.error)
      }
    })

    // Require page handler for each request to load latest version of code
    app.use((req, res, next) => import('./renderPage.js').then(module => module.default(req, res, next)))
  }

  const port = process.env.PORT || 3000

  http.createServer(app).listen(port, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`Server is listening on http://localhost:${port}`)
    }
  })
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
