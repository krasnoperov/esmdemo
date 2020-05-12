/**
 * Build styles with @modular-css/processor and postcss
 *
 * Build process consist of the next stages:
 * 1. Generate classnames for each .css file.
 * 2. Append files to the dependency graph, which starts from js entrypoints.
 * 3. For each entrypoint, concatenate related stylesheets using dependency graph.
 * 4. Run postcss with plugins from postcss.config.js as the last step
 *
 * modular-css is used because of the dependency graph, which allows to include required files exactly once.
 * Alternative package postcss-modules do not have such feature and looks abandoned.
 *
 * This plugin mostly inspired by https://github.com/tivac/modular-css/blob/master/packages/rollup/rollup.js
 * but tuned for our assets management.
 *
 * TODO: publish in npm
 */

import path from 'path'
import fs from 'fs'
import postcssLoadConfig from 'postcss-load-config'
import crypto from 'crypto'

import Processor from '@modular-css/processor'
import output from '@modular-css/processor/lib/output.js'
import chunker from '@modular-css/rollup/chunker.js'
import { createFilter } from '@rollup/pluginutils'

export default function rollupModularCss (options = {}) {
  const {
    include = ['**/*.css'],
    exclude,
    filenames = 'styles.json',
    classnames = 'classnames.json',
    verbose = false,
    map = {
      inline: false,
      annotation: false,
    },
  } = options

  const postcssrc = postcssLoadConfig.sync({})

  const filter = createFilter(include, exclude)

  // eslint-disable-next-line no-console, no-empty-function
  const log = verbose ? console.log.bind(console, '[rollup]') : () => {}

  let processor

  let handler

  return {
    name: '@modular-css/rollup',

    buildStart () {
      log('build start')

      // Initialize or reuse processor
      processor = processor || new Processor({
        ...postcssrc.options,
        map,
        verbose,
        rewrite: {
          url: (asset) => handler(asset)
        },
        done: postcssrc.plugins,
      })

      // Watch any files already in the procesor
      Object.keys(processor.files).forEach((file) => this.addWatchFile(file))
    },

    watchChange (file) {
      if (!processor.has(file)) {
        return
      }
      log('file changed', file)
      processor.invalidate(file)
    },

    async transform (code, id) {
      if (!filter(id)) {
        return null
      }

      log('transform', id)

      try {
        const processed = await processor.string(id, code)
        for (const dep of processor.dependencies(id)) {
          this.addWatchFile(dep)
        }

        return {
          code: `export default ${JSON.stringify(output.join(processed.exports), null, 4)};`,
          map: { mappings: '' },
        }

      } catch (e) {
        return this.error(e.toString())
      }
    },

    async generateBundle (outputOptions, bundle) {

      log('Bundle')

      handler = (asset) => this.getAssetFileName(
        this.emitFile({
          type: 'asset',
          name: path.basename(asset.url),
          source: fs.readFileSync(asset.absolutePath),
        })
      )

      // Store an easy-to-use Set that maps all the entry files
      const entries = new Set()

      // Clone the processor graph so we can chunk it w/o making things crazy
      const graph = processor.graph.clone()

      // Convert the graph over to a chunking-amenable format
      graph.overallOrder().forEach((node) => graph.setNodeData(node, [node]))

      // Walk all bundle entries and add them to the dependency graph
      for (const [entry, chunk] of Object.entries(bundle)) {

        const { isAsset, modules } = chunk

        /* istanbul ignore if */
        if (isAsset || !modules) {
          continue
        }

        // Get CSS files being used by this chunk
        const css = Object.keys(modules).filter(file => processor.has(file))
        if (!css.length) {
          continue
        }

        entries.add(entry)

        // TODO: this needs to check if the graph already has a value for entry and
        graph.addNode(entry, [entry])

        for (const file of css) {
          graph.addDependency(entry, processor.normalize(file))
        }
      }

      // Output CSS chunks
      const chunked = chunker({ graph, entries: [...entries] })

      // Track specified name -> output name for writing out metadata later
      const names = new Map()

      for (const node of chunked.overallOrder()) {
        // Only want to deal with CSS currently
        if (entries.has(node)) {
          continue
        }

        const baseName = path.basename(node, path.extname(node))
        const fileName = `${baseName}.css`

        log('processor.output')

        const result = await processor.output({
          to: fileName,
          map,
          files: graph.getNodeData(node),
        })

        for (const warning of result.warnings()) {
          this.warn({
            id: '',
            message: warning.text,
            loc: { file: '', line: warning.line, column: warning.column },
          })
        }

        log('hash')

        const hash = crypto.createHash('sha1')
          .update(result.css)
          .digest('hex')
          .substr(0, 16)

        const codeFileName = `${hash}.css`
        const mapFileName = `${codeFileName}.map`

        result.css += `\n/*# sourceMappingURL=${mapFileName} */`

        const id = this.emitFile({
          type: 'asset',
          fileName: codeFileName,
          source: result.css,
        })

        log('result', codeFileName)

        // Save off the final name of this asset for later use
        const dest = this.getAssetFileName(id)

        names.set(node, dest)

        if (result.map) {
          this.emitFile({
            type: 'asset',
            source: result.map.toString(),
            fileName: mapFileName,
          })
        }
      }

      // Export info about classnames
      const compositions = await processor.compositions
      this.emitFile({
        type: 'asset',
        fileName: classnames,
        source: JSON.stringify(compositions, null, 4),
      })

      const meta = {}

      for (const [entry, chunk] of Object.entries(bundle)) {
        const { isAsset } = chunk

        if (isAsset || !entries.has(entry)) {
          continue
        }

        // Attach info about this asset to the bundle
        const { assets = [] } = chunk

        chunked.dependenciesOf(entry)
          .forEach((dep) => assets.push(names.get(dep)))

        chunk.assets = assets

        meta[path.basename(bundle[entry].facadeModuleId)] = assets
      }

      // Export info about css filenames
      this.emitFile({
        type: 'asset',
        source: JSON.stringify(meta, null, 4),
        fileName: filenames,
      })
    },
  }
}
