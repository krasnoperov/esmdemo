/**
 * ESM Loader that allows importing images and CSS Modules
 */

import fs from 'fs'
import path from 'path'
import process from 'process'
import flowRemoveTypes from 'flow-remove-types'
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
  return defaultGetFormat(specifier, context, defaultGetFormat)
}


export function transformSource(source, context, defaultTransformSource) {
  const { url, format } = context;

  if (path.extname(url) === '.js') {
    return {
      source: flowRemoveTypes(source).toString()
    }
  }

  // Let Node.js handle all other sources.
  return defaultTransformSource(source, context, defaultTransformSource);
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
