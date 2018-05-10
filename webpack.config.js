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
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(version),
    }),
  ],
}
