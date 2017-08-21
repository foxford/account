const webpack = require('webpack')
const pckgJson = require('./package.json')

module.exports = {
  entry: {
    Account: './src/account',
    IdP: './src/idp'
  },
  output: {
    filename: './dist/[name].js',
    libraryTarget: 'umd',
    library: '[name]',
    libraryExport: 'default'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
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
      __VERSION__: JSON.stringify(pckgJson.version)
    })
  ]
}
