const tap = require('tap') // eslint-disable-line node/no-unpublished-require

const { Debug } = require('../../src/utils/debug')

tap.test('`Debug` helper is generally ok', (test) => {
  Promise.resolve(() => Debug())
    .catch(tap.threw)

  Promise.resolve(() => Debug('ns'))
    .then(fn => fn())
    .catch(() => {
      tap.fail()
    })

  test.end()
})

tap.test('`Debug` helper on production', (test) => {
  const oldEnv = process.env.NODE_ENV

  process.env.NODE_ENV = 'production'

  const stderr = Debug('some_namespace')

  tap.same(stderr(), undefined)
  tap.same(stderr('smth'), undefined)

  Object.assign(process.env, { NODE_ENV: oldEnv })

  test.end()
})
