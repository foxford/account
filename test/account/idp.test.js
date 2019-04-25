/* eslint promise/no-callback-in-promise: 0 */
import tap from 'tap'

import { IdP } from '../../src/idp'

tap.test('Idp is configured properly', (t) => {
  const ENDPOINT = 'http://hello.world'

  tap.throws(() => {
    const idp = new IdP() // eslint-disable-line no-unused-vars
  }, { message: 'Missing provider configuration' })

  tap.throws(() => {
    const idp = new IdP({}) // eslint-disable-line no-unused-vars
  }, { message: /Could not resolve (authentication|account) endpoint/ })

  tap.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const idp = new IdP({
      authnEndpoint: 'http://hello.world/authn',
    })
  }, { message: 'Could not resolve account endpoint' })

  tap.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const idp = new IdP({
      accountEndpoint: 'http://hello.world/account',
    })
  }, { message: 'Could not resolve authentication endpoint' })

  const idp = new IdP({
    endpoint: ENDPOINT,
  })

  tap.same(idp.endpoint, ENDPOINT)
  tap.same(idp.authnEndpoint, `${ENDPOINT}/authn`)
  tap.same(idp.accountEndpoint, `${ENDPOINT}/accounts`)

  const idp2 = new IdP({
    authnEndpoint: `${ENDPOINT}/authn`,
    accountEndpoint: `${ENDPOINT}/accts`,
  })

  tap.same(idp2.endpoint, undefined)
  tap.same(idp2.authnEndpoint, `${ENDPOINT}/authn`)
  tap.same(idp2.accountEndpoint, `${ENDPOINT}/accts`)

  const idp3 = new IdP({
    authnEndpoint: () => `${ENDPOINT}/authn`,
    accountEndpoint: () => `${ENDPOINT}/accts`,
  })

  tap.same(idp3.authnEndpoint, `${ENDPOINT}/authn`)
  tap.same(idp3.accountEndpoint, `${ENDPOINT}/accts`)

  const idp4 = new IdP({
    endpoint: 'http://hello.anotherworld',
    authnEndpoint: `${ENDPOINT}/authentication`,
    accountEndpoint: `${ENDPOINT}/accts`,
  })

  tap.same(idp4.authnEndpoint, `${ENDPOINT}/authentication`)
  tap.same(idp4.accountEndpoint, `${ENDPOINT}/accts`)

  const idp5 = new IdP({
    endpoint: 'http://hello.anotherworld',
    authnEndpoint: () => `${ENDPOINT}/authentication`,
    accountEndpoint: () => `${ENDPOINT}/accts`,
  })

  tap.same(idp5.authnEndpoint, `${ENDPOINT}/authentication`)
  tap.same(idp5.accountEndpoint, `${ENDPOINT}/accts`)

  t.end()
})
