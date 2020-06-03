import fs from 'fs'
import path from 'path'
import Express from 'express'
import http from 'http'
import serveStatic from 'serve-static'
import { BASE_PATH } from './loadAssetsMeta.js'
import renderPage from './renderPage.js'

console.log(`Server is starting`)

async function main () {

  const app = new Express()
  app.use('/static/', serveStatic(path.join(BASE_PATH, 'build/static/')))

  app.use(renderPage)

  const port = process.env.PORT || 3000

  const instance = http.createServer(app).listen(port, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`Server is listening on http://localhost:${port}`)
    }
  })

  function gracefulShutdown () {
    const shutdownStart = new Date()
    console.log('Received kill signal, shutting down gracefully')

    instance.close(function () {
      const ms = new Date() - shutdownStart
      console.log(`Closed out remaining connections in ${ms}ms`)
      process.exit()
    })

    // if after
    setTimeout(function () {
      console.error('Could not close connections in time, forcefully shutting down')
      process.exit()
    }, 10 * 1000)
  }

  // listen for TERM signal .e.g. kill
  process.on('SIGTERM', gracefulShutdown)
  // listen for INT signal e.g. Ctrl-C
  process.on('SIGINT', gracefulShutdown)
  // listen for USR2 signal e.g. restart
  process.on('SIGUSR2', gracefulShutdown)

}
main().catch(e => {
  console.error(e)
  process.exit(1)
})
