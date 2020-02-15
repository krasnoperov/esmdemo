/**
 * ESM Loader that allows importing images and CSS Modules
 */

import fs from 'fs'
import path from 'path'
import process from 'process'
import { pathToFileURL, fileURLToPath, URL } from 'url'
import { loadAssetsMeta, BASE_PATH } from './loadAssetsMeta.js'

// TODO: refresh assets meta on build in development mode
const staticFiles = loadAssetsMeta('build/static/static.json')
const cssExports = loadAssetsMeta('build/static/classnames.json')

const EXTENSIONS = new Set([
  // Supported static files from tools/rollup-statics.js
  '.ico',
  '.png',
  '.svg',
  // CSS Modules
  '.css'
])

const BASE_URL = pathToFileURL(BASE_PATH).href

export async function resolve (specifier, context, defaultResolver) {
  const { parentURL = BASE_URL } = context;
  if (EXTENSIONS.has(path.extname(specifier))) {
    return {
      url: (parentURL) ? new URL(specifier, parentURL).href : new URL(specifier).href,
      // format: 'dynamic'
    }
  }
  return defaultResolver(specifier, context, defaultResolver)
}

export async function getFormat (specifier, context, defaultGetFormat) {
  if (EXTENSIONS.has(path.extname(specifier))) {
    return {
      format: 'dynamic'
    }
  }
  const format = defaultGetFormat(specifier, context, defaultGetFormat)

  // TODO: remove when Node will detect preact as ESM module
  if (specifier.endsWith("/node_modules/preact/dist/preact.module.js") && format.format !== 'module'){
    return {
      format: 'module'
    }
  }

  return format
}

export async function dynamicInstantiate (url, a) {
  const filename = fileURLToPath(url)

  if (path.extname(filename) === '.css') {

    // Export default object with classnames for CSS Module
    // import styles from './styles.css'

    return {
      exports: ['default'],
      execute: (exports) => {
        exports.default.set(
          cssExports[path.relative(BASE_PATH, filename)] || {}
        )
      }
    }
  }

  // Export default string with URL of image file
  // import image from './image.svg'

  return {
    exports: ['default'],
    execute: (exports) => {
      exports.default.set(
        staticFiles[path.relative(BASE_PATH, filename)]
      )
    }
  }
}
