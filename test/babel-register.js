const babelrc = require('../.babelrc.json')

// eslint-disable-next-line node/no-unpublished-require
require('@babel/register')({
  ...babelrc.env.cjs,
})
