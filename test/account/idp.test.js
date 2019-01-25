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
  }, { message: /Can not resolve (authentication|account) endpoint/ })

  tap.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const idp = new IdP({
      authnEndpoint: 'http://hello.world/auth',
    })
  }, { message: 'Can not resolve account endpoint' })

  tap.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const idp = new IdP({
      accountEndpoint: 'http://hello.world/account',
    })
  }, { message: 'Can not resolve authentication endpoint' })

  const idp = new IdP({
    endpoint: ENDPOINT,
  })

  tap.same(idp.endpoint, ENDPOINT)
  tap.same(idp.accountEndpoint, `${ENDPOINT}/accounts`)
  tap.same(idp.authnEndpoint, `${ENDPOINT}/auth`)

  const idp2 = new IdP({
    authnEndpoint: `${ENDPOINT}/authn`,
    accountEndpoint: `${ENDPOINT}/accts`,
  })

  tap.same(idp2.endpoint, undefined)
  tap.same(idp2.accountEndpoint, `${ENDPOINT}/accts`)
  tap.same(idp2.authnEndpoint, `${ENDPOINT}/authn`)

  const idp3 = new IdP({
    authnEndpoint: () => `${ENDPOINT}/authn`,
    accountEndpoint: () => `${ENDPOINT}/accts`,
  })

  tap.same(idp3.accountEndpoint, `${ENDPOINT}/accts`)
  tap.same(idp3.authnEndpoint, `${ENDPOINT}/authn`)

  t.end()
})
