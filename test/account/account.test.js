/* eslint promise/no-callback-in-promise: 0 */
import 'isomorphic-fetch'
import Debug from 'debug'
import fetchMock from 'fetch-mock'
import tap from 'tap'

import { Account } from '../../src/account'
import { IdP } from '../../src/idp'
import { name } from '../../package.json'

import {
  label,
  audience,
  accountResponse,
  refreshResponse,
  revokeResponse,
} from '../response.mock'
import storageMock from '../storage.mock'

global.self = global
// bind global to self for the fetch polyfill
require('whatwg-fetch') // eslint-disable-line node/no-unpublished-require

const isError = (error, msg = null) => tap.ok(error instanceof Error, msg)

const isErrorSays = (error, errorShouldBe) => {
  isError(error)
  tap.equal(error.message, errorShouldBe)
}

const debug = Debug(`${name}:account`)

const allErrors = list => list.map(next => tap.ok(next instanceof Error, false))

const PromiseAllErrors = (fn, data) => new Promise((resolve, reject) => {
  let errors = []

  data.map(next => fn(next)
    .then(res => reject(res))
    .catch((error) => {
      errors = errors.concat(error)
      if (errors.length === data.length) resolve(errors)
      if (!(error instanceof Error)) reject(new Error('Failed'))
    }))
})

const storage = storageMock()

const getAccount = (opts = {}, store) => {
  debug('Create account instance')

  return new Account({
    provider: new IdP(opts.provider || { endpoint: 'https://mock-host' }),
    ...(opts.account || {
      audience,
    }),
  }, store || storage)
}

const authKey = 'oauth2.key'
const params = {
  client_token: '12345',
  grant_type: 'client_credentials',
}

// const fetchMocks = ({
//   account,
//   authKey: key,
//   label: id,
//   id: someid,
//   action: action = 'refresh',
//   response = refreshResponse,
// }) => {
//   fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
//     body: accountResponse,
//   }, {
//     method: 'GET',
//   })
//   fetchMock.mock(`${account.provider.endpoint}/accounts/${someid}/${action}`, {
//     body: response,
//   }, {
//     methods: 'POST',
//   })
// }

// const fetchMocksOnRefresh = _ => fetchMocks(Object.assign({}, _, {
//   action: 'refresh',
//   response: refreshResponse,
// }))

// const fetchMocksOnRevoke = _ => fetchMocks(Object.assign({}, _, {
//   action: 'revoke',
//   response: revokeResponse,
// }))
//
// const fetchMocksOnGet = ({
//   account,
//   authKey: key,
//   label: id,
//   response,
// }) => {
//   fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
//     body: response,
//   }, {
//     method: 'GET',
//   })
// }

// const fetchMocksOnSignIn = ({
//   account,
//   authKey: key,
//   label: id,
//   response,
// }) => {
//   fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
//     body: response,
//   }, {
//     method: 'GET',
//   })
// }

tap.test('Promise.all errors', (t) => {
  t.test('Handle multiple negative requests', (test) => {
    const negative = () => Promise.reject(new Error('Error'))

    PromiseAllErrors(negative, [1, 2, 3])
      .then(allErrors)
      .then(test.end)
      .catch(tap.error)
  })

  t.test('Can not handle any positive request', (test) => {
    const maybePositive = value => value === 2
      ? Promise.resolve(true)
      : Promise.reject(new Error('Error'))

    PromiseAllErrors(maybePositive, [1, 2, 3])
      .catch(() => {
        tap.ok('Failed')
        test.end()
      })
  })

  t.end()
})

tap.test('Account', (t) => {
  t.test('construct', (test) => {
    let account = getAccount()

    tap.not(account, undefined)
    tap.same(account.id, `me.${audience}`)
    tap.same(account.label, 'me')

    account = getAccount({
      account: {
        label: 'you',
        audience,
      },
    })

    tap.not(account, undefined)
    tap.same(account.id, `you.${audience}`)
    tap.same(account.label, 'you')

    tap.throws(() => {
      getAccount({
        account: {
          label: 'you',
        },
      })
    }, { message: '`audience` is absent' })

    test.end()
  })

  t.end()
})

tap.test('Account', (t) => {
  function ClosureStorage (initialState) {
    this.storage = initialState || {}

    this.setItem = (key, value) => {
      if (typeof value !== 'string') throw new TypeError('Wrong value format')
      this.storage[key] = value
    }

    this.getItem = key => this.storage[key]

    this.removeItem = (key) => {
      delete this.storage[key]
    }
  }

  t.test('load void from empty storage', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)

    acc.load()
      .catch((error) => {
        tap.same(error.message, 'Can not load data')
        test.end()
      })
  })
  t.test('load void from not empty storage', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)

    strg.setItem(acc.id, '{"a":123}')

    acc.load()
      .then((tokenData) => {
        tap.same(tokenData, { a: 123 })

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('remove void from empty storage', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)

    acc.remove()
      .catch((error) => {
        tap.same(error.message, 'Can not load data')
        test.end()
      })
  })

  t.test('remove void from not empty storage', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)

    strg.setItem(acc.id, '{"a":123}')

    acc.remove()
      .then((tokenData) => {
        tap.same(tokenData, { a: 123 })
        tap.same(strg.getItem(acc.id, undefined))

        return test.end()
      })
      .catch(tap.error)
  })
  t.test('load failed as expected', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)

    strg.setItem(acc.id, '"')

    tap.throws(acc.load)

    test.end()
  })

  t.test('load is ok for valid JSON', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)

    strg.setItem(acc.id, '{"a":"123"}')

    acc.load()
      .then((data) => {
        tap.same(data, { a: 123 })

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('store a token', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)

    acc.store({
      access_token: 'somestring',
    })
      .then((data) => {
        tap.same(data, {
          access_token: 'somestring',
          expires_time: 0,
        })

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('store a token that should be expired', (test) => {
    const strg = new ClosureStorage()
    const acc = getAccount({}, strg)
    const _now = global.Date.now
    const sometime = JSON.stringify(_now())

    global.Date.now = () => Number(sometime)

    acc.store({
      expires_in: 2,
      refresh_token: 'somestring',
    })
      .then((data) => {
        tap.same(data, {
          refresh_token: 'somestring',
          expires_in: 2,
          expires_time: Date.now() + 2e3,
        })

        return data
      })
      .finally(() => {
        global.Date.now = _now
        test.end()
      })
      .catch(tap.error)
  })

  t.end()
})

tap.test('Account', (t) => {
  //
  // t.test('`refresh` returns an error when pass negative values', (test) => {
  //   const account = getAccount()
  //
  //   fetchMocksOnRefresh({
  //     account, authKey, label, id: label,
  //   })
  //
  //   const negativeValues = [undefined, null, '']
  //
  //   PromiseAllErrors(
  //     val => account
  //       .signIn({ auth_key: authKey, params })
  //       .then(account.refresh(val)),
  //     negativeValues
  //   )
  //     .then(allErrors)
  //     .then(() => {
  //       storage.removeItem(`account_${signInId}`)
  //
  //       return test.end()
  //     })
  //     .catch(tap.error)
  // })
  //
  // t.test('`refresh` successful response', (test) => {
  //   const account = getAccount()
  //
  //   fetchMocksOnRefresh({
  //     account, authKey, label, id: label,
  //   })
  //
  //   account.signIn({ auth_key: authKey, params })
  //     .then(account.refresh(label))
  //     .then((res) => {
  //       tap.strictSame(JSON.stringify(res), JSON.stringify(refreshResponse))
  //
  //       storage.removeItem(`account_${signInId}`)
  //
  //       return test.end()
  //     })
  //     .catch(tap.error)
  // })
  //
  // t.test('`refresh` аccess token from response equal to the access token from localStorage', (test) => {
  //   const account = getAccount()
  //
  //   fetchMocksOnRefresh({
  //     account, authKey, label, id: label,
  //   })
  //
  //   account.signIn({ auth_key: authKey, params })
  //     .then(account.refresh(label))
  //     .then(() => {
  //       const accessToken = JSON.parse(storage.getItem(`account_${signInId}`)).access_token
  //
  //       tap.strictSame(refreshResponse.access_token, accessToken)
  //
  //       storage.removeItem(`account_${signInId}`)
  //
  //       return test.end()
  //     })
  //     .catch(tap.error)
  // })
  //
  // t.test('`revoke` returns error when pass negative values', (test) => {
  //   const account = getAccount()
  //
  //   fetchMocksOnRevoke({
  //     account, authKey, label, id: label,
  //   })
  //
  //   const negativeValues = [undefined, null, '']
  //
  //   PromiseAllErrors(
  //     val => account
  //       .signIn({ auth_key: authKey, params })
  //       .then(account.revoke(val)),
  //     negativeValues
  //   )
  //     .then(allErrors)
  //     .then(test.end)
  //     .catch(tap.throws)
  // })
  //
  // t.test('`revoke` successful response', (test) => {
  //   const account = getAccount()
  //
  //   fetchMocksOnRevoke({
  //     account, authKey, label, id: label,
  //   })
  //
  //   account.signIn({ auth_key: authKey, params })
  //     .then(account.revoke(label))
  //     .then((res) => {
  //       tap.strictSame(JSON.stringify(res), JSON.stringify(revokeResponse))
  //
  //       storage.removeItem(`account_${signInId}`)
  //
  //       return test.end()
  //     })
  //     .catch(tap.error)
  // })
  //
  // t.test('`revoke` refresh token from response equal refresh token from localStorage', (test) => {
  //   const account = getAccount()
  //
  //   fetchMocksOnRevoke({
  //     account, authKey, label, id: label,
  //   })
  //
  //   account.signIn({ auth_key: authKey, params })
  //     .then(account.revoke(label))
  //     .then(() => {
  //       const refreshToken = JSON.parse(storage.getItem(`account_${signInId}`)).refresh_token
  //
  //       tap.strictSame(revokeResponse.refresh_token, refreshToken)
  //
  //       storage.removeItem(`account_${signInId}`)
  //
  //       return test.end()
  //     })
  //     .catch(tap.error)
  // })

  t.end()
})
