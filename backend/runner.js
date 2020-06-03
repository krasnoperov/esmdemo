import { watch } from 'rollup'
import config from '../rollup.config.js'
import nodemon from 'nodemon'
import colors from 'colors/safe.js'

watch(config).on('event', event => {
  if (event.code === 'START') {
    console.log(colors.yellow('[rollup] Start build, stop backend, and pause requests'))
    nodemon.emit('quit')
  }
  else if (event.code === 'BUNDLE_START') {
    console.log(colors.blue('[rollup] Build'), colors.black(event.input))
  }
  else if (event.code === 'BUNDLE_END') {
    console.log(colors.green('[rollup] Done'), colors.black(event.input), 'in', event.duration / 1000, 's')
  }
  else if (event.code === 'END') {
    console.log(colors.yellow('[rollup] Finish build, restart backend, and resume requests'))
    nodemon(process.argv.slice(2).join(' ')).on('log', ({ type, colour }) => !['log', 'info'].includes(type) && console.log(colour))
  } else if (event.code === 'ERROR' || event.code === 'FATAL') {
    console.error(event.error)
  }
})

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', () => {
  nodemon.emit('quit')
  process.exit()
})
