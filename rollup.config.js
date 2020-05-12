import path from 'path'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import postcss from './tools/rollup-modular-css.js'
import statics from './tools/rollup-statics.js'
import entrypoint from './tools/rollup-entrypoint.js'

// Public prefix of external files
const STATIC_PATH = '/static'

export default [
  {
    input: 'frontend/index.js',
    output: {
      dir: path.join('build', STATIC_PATH),
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].[hash].js',
      chunkFileNames: '[name].[hash].js',
      assetFileNames: 'media/[name].[hash][extname]'
    },
    plugins: [

      // Locate modules in node_modules
      resolve({
        mainFields: ['module', 'main'],
        extensions: ['.mjs', '.js'],
      }),

      // Generate separate css file and manifest with hashed file name
      postcss({ staticPath: STATIC_PATH }),

      // Generate separate image files and manifest with hashed file names
      statics({ staticPath: STATIC_PATH }),

      // Strip flow types from source code, no other transformations are applied
      babel({
        configFile: false,
        babelrc: false,
        compact: true,
        exclude: 'node_modules/**',
        plugins: [
          '@babel/plugin-transform-flow-strip-types',
        ],
      }),

      // Generate manifest with hashed name of main javascript file
      entrypoint(),
    ],
  }
]
