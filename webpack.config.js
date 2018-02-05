const webpack = require('webpack')

const { version } = require('./package.json')

module.exports = {
  entry: {
    Account: './src',
  },
  output: {
    filename: './dist/account.js',
    libraryTarget: 'umd',
    library: '[name]',
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        'babel-loader',
        'eslint-loader'
      ]
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(version)
    })
  ]
}
