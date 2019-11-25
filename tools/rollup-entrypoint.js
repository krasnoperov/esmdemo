/**
 * Provide manifest with generated filenames for backend/renderPage.js
 *
 * TODO: publish in npm
 */

import path from 'path'
import fs from 'fs'

export default function (options = {}) {
  const {
    manifest = 'entrypoint.json',
  } = options

  return {
    name: './tools/rollup-entrypoint',
    async generateBundle (outputOptions, bundle) {
      const base = options.destDir || outputOptions.dir || path.dirname(outputOptions.file)
      await fs.promises.mkdir(base, { recursive: true })

      let entrypointMaps = {}
      try {
        entrypointMaps = JSON.parse(await fs.promises.readFile(path.join(base, manifest)))
      } catch (e) {
        // ignore
      }

      for (let key of Object.keys(bundle)) {
        if (bundle[key].isEntry || bundle[key].isDynamicEntry) {
          const name = path.basename(bundle[key].facadeModuleId)
          entrypointMaps[name] = {
            fileName: bundle[key].fileName,
            imports: bundle[key].imports,
          }
        }
      }

      await fs.promises.writeFile(path.join(base, manifest), JSON.stringify(entrypointMaps, null, '  '))
    },
  }
}
