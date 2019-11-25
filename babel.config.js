// Server-side babel config for nodejs

module.exports = function (api) {

  api.cache(true)

  return {
    presets: [
      ['@babel/preset-env', {
        'targets': {
          'node': 'current',
          'browsers': [],
        },
      }],
    ],
    plugins: [
      // Babel on server is required only for removing flow types
      '@babel/transform-flow-strip-types',
      'dynamic-import-node',
    ],
  }
}
