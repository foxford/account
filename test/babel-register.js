const babelrc = require('../.babelrc')

// eslint-disable-next-line node/no-unpublished-require
require('@babel/register')({
  ...babelrc.env.cjs,
  only: [/node_modules/, /test/, /src/],
})
