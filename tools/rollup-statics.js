/**
 * Resolve imports of images and provide manifest with generated filenames for backend/cjsloader.js
 *
 * TODO: publish in npm
 */

import { createFilter } from '@rollup/pluginutils'
import path from 'path'
import fs from 'fs'
import process from 'process'

const defaultInclude = [
  '**/*.ico',
  '**/*.svg',
  '**/*.png',
]

const BASE_PATH = process.cwd()

async function loadJson (filename) {
  try {
    return JSON.parse(await fs.promises.readFile(filename))
  } catch (e) {
    return null
  }
}

export default function (options = {}) {
  const {
    include = defaultInclude,
    exclude,
    staticPath = '',
    emitFiles = true,
    dropInput = false,
    manifest = 'static.json',
  } = options

  const filter = createFilter(include, exclude)

  const ids = {}

  let manifestReferenceId

  function getPublicPath (filename) {
    return path.join(staticPath, filename)
  }

  return {
    name: './tools/rollup-statics',

    buildStart () {
      // Prepare empty asset for manifest file
      manifestReferenceId = this.emitFile({
        type: 'asset',
        name: manifest,
        fileName: manifest,
      })
    },

    async load (id) {
      if (!filter(id)) return null

      // Extract static asset
      const assetReferenceId = this.emitFile({
        type: 'asset',
        source: await fs.promises.readFile(id),
        name: path.basename(id),
      })

      ids[id] = assetReferenceId

      // js bundle can use static assets too
      return `export default import.meta.ROLLUP_FILE_URL_${assetReferenceId};`
    },

    // Generate asset URL for use in client bundle
    resolveFileUrl: ({ fileName }) => `'${getPublicPath(fileName)}'`,

    async generateBundle (outputOptions, bundle) {
      if (!emitFiles) return

      // Sometimes we need only assets, not source .js files
      if (dropInput) {
        for (const key of Object.keys(bundle)) {
          if (Object.keys(ids).includes(bundle[key].facadeModuleId)) {
            delete bundle[key]
          }
        }
      }

      const baseDir = options.destDir || outputOptions.dir || path.dirname(outputOptions.file)

      const staticsMap = (await loadJson(path.join(baseDir, this.getFileName(manifestReferenceId)))) || {}

      for (const [name, assetReferenceId] of Object.entries(ids)) {
        const sourceFileName = path.relative(BASE_PATH, name)
        const assetFileName = this.getFileName(assetReferenceId)

        // Generate asset URL for use on server
        staticsMap[sourceFileName] = getPublicPath(assetFileName)
      }

      // Set content of manifest asset
      this.setAssetSource(manifestReferenceId, JSON.stringify(staticsMap, null, '  '))
    },
  }
}
