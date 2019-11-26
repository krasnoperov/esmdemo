/**
 * CJS Loader that allows importing images and CSS Modules
 */
import path from 'path'
import fs from 'fs'
import process from 'process'
import { loadAssetsMeta, BASE_PATH } from './loadAssetsMeta.js'

export default function () {

  if (process.env.ESM_ENABLED === 'yes') {
    // Do not try yo alter require.extensions with ES Modules
    return
  }

  const staticFiles = loadAssetsMeta('build/static/static.json')
  const resolver = (module, filename) =>
    module._compile(`module.exports = '${staticFiles[path.relative(BASE_PATH, filename)] || ''}'`, filename)

  // https://nodejs.org/api/modules.html#modules_require_extensions
  for (const ext of ['.png', '.pdf', '.svg', '.aac', '.m4a']) {
    require.extensions[ext] = resolver
  }

  const cssExports = loadAssetsMeta('build/static/classnames.json')
  require.extensions['.css'] = (module, filename) =>
    module._compile(`module.exports = ${JSON.stringify(cssExports[path.relative(BASE_PATH, filename)] || {})}`, filename)
}
