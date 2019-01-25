/* eslint promise/no-callback-in-promise: 0 */
import 'isomorphic-fetch'
import Debug from 'debug'
import fetchMock from 'fetch-mock'
import tap from 'tap'

import { Account } from '../../src/account'
import { IdP } from '../../src/idp'
import { name } from '../../package.json'

import {
  signInResponse,
  signInRefreshToken,
  myAccountId,
  accountResponse,
  refreshResponse,
  revokeResponse,
  signInId,
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
    ...(opts.account || {}),
  }, store || storage)
}

const authKey = 'oauth2.key'
const params = {
  client_token: '12345',
  grant_type: 'client_credentials',
}

const fetchMocks = ({
  account,
  authKey: key,
  myAccountId: id,
  id: someid,
  action: action = 'refresh',
  response = refreshResponse,
}) => {
  fetchMock.mock(`${account.provider.endpoint}/auth/${key}/token`, {
    body: signInResponse,
  }, {
    method: 'POST',
  })
  fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
    body: accountResponse,
  }, {
    method: 'GET',
  })
  fetchMock.mock(`${account.provider.endpoint}/accounts/${someid}/${action}`, {
    body: response,
  }, {
    methods: 'POST',
  })
}

const fetchMocksOnRefresh = _ => fetchMocks(Object.assign({}, _, {
  action: 'refresh',
  response: refreshResponse,
}))

const fetchMocksOnRevoke = _ => fetchMocks(Object.assign({}, _, {
  action: 'revoke',
  response: revokeResponse,
}))

const fetchMocksOnGet = ({
  account,
  authKey: key,
  myAccountId: id,
  response,
}) => {
  fetchMock.mock(`${account.provider.endpoint}/auth/${key}/token`, {
    body: signInResponse,
  }, {
    method: 'POST',
  })
  fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
    body: response,
  }, {
    method: 'GET',
  })
}

const fetchMocksOnSignIn = ({
  account,
  authKey: key,
  myAccountId: id,
  response,
}) => {
  fetchMock.mock(`${account.provider.endpoint}/auth/${key}/token`, {
    body: signInResponse,
  }, {
    method: 'POST',
  })
  fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
    body: response,
  }, {
    method: 'GET',
  })
}

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
    const account = getAccount()

    tap.not(account, undefined)
    test.end()
  })

  t.test('`_checkStatus` returns error when pass negative values', (test) => {
    const account = getAccount()

    account._checkStatus()
      .catch((error) => {
        tap.ok(error instanceof Error)
        test.end()
      })
  })

  t.test('`_checkStatus` returns response with 200 code', (test) => {
    const account = getAccount()

    fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
      body: signInResponse,
    }, {
      method: 'POST',
    })

    fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
      .then(account._checkStatus)
      .then((response) => {
        tap.same(response.status, 200)

        return test.end()
      })
      .catch((error) => {
        logger.error(error)
        test.end()
      })
  })

  t.test('`_checkStatus` returns error (404 code)', (test) => {
    const account = getAccount()

    fetchMock.postOnce(`${account.provider.endpoint}/auth/${authKey}/token`, {
      status: 404,
      body: signInResponse,
    })

    fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
      .then(account._checkStatus)
      .catch((error) => {
        tap.ok(error instanceof Error)
        tap.same(error.response.status, 404)
        test.end()
      })
  })

  t.test('`_parseJSON` returns error when pass negative values', (test) => {
    const account = getAccount()

    try {
      account._parseJSON()
    } catch (error) {
      tap.ok(error instanceof Error)
    }
    test.end()
  })

  t.test('`_parseJSON` returns json object', (test) => {
    const account = getAccount()

    fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
      body: signInResponse,
    }, {
      method: 'POST',
    })

    fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
      .then(account._parseJSON)
      .then((res) => {
        tap.strictSame(JSON.stringify(res), JSON.stringify(signInResponse))

        return test.end()
      })
      .catch((error) => {
        logger.error(error)
        test.end()
      })
  })

  t.test('`signIn` returns an error when pass negative values', (test) => {
    const account = getAccount()

    fetchMocks({
      account, authKey, myAccountId, id: myAccountId,
    })

    const negativeValues = [
      undefined,
      null,
      '',
      {},
      { auth_key: undefined, params: undefined },
      { auth_key: null, params: null },
      { auth_key: '', params: '' },
      { refresh_token: undefined },
      { refresh_token: null },
      { refresh_token: '' },
    ]

    PromiseAllErrors(val => account.signIn(val), negativeValues)
      .then(allErrors)
      .then(() => {
        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`signIn` successful response (`authKey` and `params`)', (test) => {
    const account = getAccount()

    fetchMocks({
      account, authKey, myAccountId, id: myAccountId,
    })

    account.signIn({ auth_key: authKey, params })
      .then((res) => {
        tap.strictSame(JSON.stringify(res), JSON.stringify(signInResponse))
        tap.strictSame(!!storage.getItem(`account_${signInId}`), true)

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(error => logger.error(error))
  })

  t.test('`signIn` successfull response when token expired', (test) => {
    const account = getAccount()

    fetchMocks({
      account, authKey, myAccountId, id: myAccountId,
    })

    // sign in at first
    account.signIn({ auth_key: authKey, params })
      .then(() => {
        const store = JSON.parse(storage.getItem(`account_${signInId}`))

        store.expires_time = store.expires_time - (store.expires_in * 1000) - account.expiresLeeway

        storage.setItem(`account_${signInId}`, JSON.stringify(store))

        return true
      })
      .then(() => account.signIn({ auth_key: authKey, params }))
      .then((res) => {
        tap.strictSame(JSON.stringify(res), JSON.stringify(signInResponse))

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`signIn` successfull response (`refresh_token`)', (test) => {
    const account = getAccount()

    fetchMocks({
      account, authKey, myAccountId, id: myAccountId,
    })

    storage.removeItem(`account_${signInId}`)

    account.signIn({ refresh_token: signInRefreshToken })
      .then((res) => {
        tap.strictSame(JSON.stringify(res), JSON.stringify(refreshResponse))

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`signIn` returns token data from localStorage', (test) => {
    const account = getAccount({
      account: {
        id: signInId,
      },
    })

    fetchMocks({
      account, authKey, myAccountId, id: myAccountId,
    })

    // sign in at first
    account.signIn({ auth_key: authKey, params })
      .then(() => {
        const store = JSON.parse(storage.getItem(`account_${signInId}`))

        store.expires_time = store.expires_time - (store.expires_in * 1000) - account.expiresLeeway

        storage.setItem(`account_${signInId}`, JSON.stringify(store))

        return true
      })
      .then(() => account.signIn())
      .then((res) => {
        tap.type(res, 'object')

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`refresh` returns an error when pass negative values', (test) => {
    const account = getAccount()

    fetchMocksOnRefresh({
      account, authKey, myAccountId, id: myAccountId,
    })

    const negativeValues = [undefined, null, '']

    PromiseAllErrors(
      val => account
        .signIn({ auth_key: authKey, params })
        .then(account.refresh(val)),
      negativeValues
    )
      .then(allErrors)
      .then(() => {
        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`refresh` successful response', (test) => {
    const account = getAccount()

    fetchMocksOnRefresh({
      account, authKey, myAccountId, id: myAccountId,
    })

    account.signIn({ auth_key: authKey, params })
      .then(account.refresh(myAccountId))
      .then((res) => {
        tap.strictSame(JSON.stringify(res), JSON.stringify(refreshResponse))

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`refresh` аccess token from response equal to the access token from localStorage', (test) => {
    const account = getAccount()

    fetchMocksOnRefresh({
      account, authKey, myAccountId, id: myAccountId,
    })

    account.signIn({ auth_key: authKey, params })
      .then(account.refresh(myAccountId))
      .then(() => {
        const accessToken = JSON.parse(storage.getItem(`account_${signInId}`)).access_token

        tap.strictSame(refreshResponse.access_token, accessToken)

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`revoke` returns error when pass negative values', (test) => {
    const account = getAccount()

    fetchMocksOnRevoke({
      account, authKey, myAccountId, id: myAccountId,
    })

    const negativeValues = [undefined, null, '']

    PromiseAllErrors(
      val => account
        .signIn({ auth_key: authKey, params })
        .then(account.revoke(val)),
      negativeValues
    )
      .then(allErrors)
      .then(test.end)
      .catch(tap.throws)
  })

  t.test('`revoke` successful response', (test) => {
    const account = getAccount()

    fetchMocksOnRevoke({
      account, authKey, myAccountId, id: myAccountId,
    })

    account.signIn({ auth_key: authKey, params })
      .then(account.revoke(myAccountId))
      .then((res) => {
        tap.strictSame(JSON.stringify(res), JSON.stringify(revokeResponse))

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`revoke` refresh token from response equal refresh token from localStorage', (test) => {
    const account = getAccount()

    fetchMocksOnRevoke({
      account, authKey, myAccountId, id: myAccountId,
    })

    account.signIn({ auth_key: authKey, params })
      .then(account.revoke(myAccountId))
      .then(() => {
        const refreshToken = JSON.parse(storage.getItem(`account_${signInId}`)).refresh_token

        tap.strictSame(revokeResponse.refresh_token, refreshToken)

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`get` returns error when pass negative values', (test) => {
    const account = getAccount()

    fetchMocksOnGet({
      account, authKey, myAccountId, response: accountResponse,
    })

    const negativeValues = [undefined, null, '']

    PromiseAllErrors(
      val => account
        .signIn({ auth_key: authKey, params })
        .then(account.get(val)),
      negativeValues
    )
      .then(allErrors)
      .then(() => {
        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`get` accountId from `signIn` is equal to the accountId from `get`', (test) => {
    const account = getAccount()

    fetchMocksOnGet({
      account, authKey, myAccountId, response: accountResponse,
    })

    let responseId = null

    account.signIn({ auth_key: authKey, params })
      .then((res) => {
        responseId = res.id

        return account.get(myAccountId)
      })
      .then((res) => {
        tap.strictSame(res.id, responseId)

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`get` accountId from localStorage is equal to the accountId from `get`', (test) => {
    const account = getAccount()

    fetchMocksOnGet({
      account, authKey, myAccountId, response: accountResponse,
    })

    account.signIn({ auth_key: authKey, params })
      .then(account.get(myAccountId))
      .then((res) => {
        tap.strictSame(res.id, signInId)

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.test('`signOut` initial state has been set (localStorage item, account.id)', (test) => {
    const account = getAccount()

    fetchMocksOnSignIn({
      account, authKey, myAccountId, response: accountResponse,
    })

    account.signIn({ auth_key: authKey, params })
      .then(() => account.signOut())
      .then(() => {
        tap.strictSame(storage.getItem(`account_${signInId}`), null)
        tap.strictSame(account.id, null)

        storage.removeItem(`account_${signInId}`)

        return test.end()
      })
      .catch(tap.error)
  })

  t.end()
})

tap.test('Account._getTokenData', (t) => {
  t.test('Fetched data with no ID', (test) => {
    const account = getAccount()

    Promise.resolve()
      .then(() => account._getTokenData())
      .then((res) => {
        tap.deepEqual(res, {})

        return test.end()
      })
      .catch((error) => {
        debug(error)
        test.end()
      })
  })

  t.test('Fetched data with ID but empty', (test) => {
    const account = getAccount({
      account: {
        id: 'account_id_value',
      },
    })

    Promise.resolve()
      .then(() => account._getTokenData())
      .then((res) => {
        tap.deepEqual(res, {})

        return test.end()
      })
      .catch((error) => {
        isError(error)
        test.end()
      })
  })

  t.test('Fetched data with ID but not JSON', (test) => {
    const store = storageMock()

    const account = getAccount({
      account: { id: 'me' },
    }, store)

    store.setItem('account_me', { a: 123 })

    Promise.resolve()
      .then(() => account._getTokenData())
      .catch((error) => {
        isError(error)
        test.end()
      })
  })

  t.test('Fetched data with ID', (test) => {
    const store = storageMock()

    const account = getAccount({
      account: { id: 'me' },
    }, store)

    store.setItem('account_me', JSON.stringify({ data: 123 }))

    Promise.resolve()
      .then(() => account._getTokenData())
      .then(({ data }) => {
        tap.equals(data, 123)

        return test.end()
      })
      .catch(error => logger.error(error))
  })

  t.end()
})

tap.test('Account._getTokenDataP', (t) => {
  t.test('Fetched data with no ID', (test) => {
    const account = getAccount()

    account._getTokenDataP()
      .then((res) => {
        tap.deepEqual(res, {})

        return test.end()
      })
      .catch((error) => {
        isError(error, 'Fails as expected')
        test.end()
      })
  })

  t.test('Fetched data with ID but empty', (test) => {
    const account = getAccount({
      account: { id: 'me' },
    })

    account._getTokenDataP()
      .then((res) => {
        tap.deepEqual(res, {})

        return test.end()
      })
      .catch((error) => {
        isError(error)
        test.end()
      })
  })

  t.test('Fetched data with ID but not JSON', (test) => {
    const store = storageMock()

    const account = getAccount({
      account: { id: 'me' },
    }, store)

    store.setItem('account_me', { a: 123 })

    account._getTokenDataP()
      .catch((error) => {
        isError(error)
        test.end()
      })
  })

  t.test('Fetched data with ID', (test) => {
    const store = storageMock()

    const account = getAccount({
      account: { id: 'me' },
    }, store)

    store.setItem('account_me', JSON.stringify({ data: 123 }))

    account._getTokenDataP()
      .then(({ data }) => {
        tap.equals(data, 123)

        return test.end()
      })
      .catch(error => logger.error(error))
  })

  t.end()
})

tap.test('Account._parseJSON', (t) => {
  t.test('Fails as expected on empty response', (test) => {
    const account = getAccount()

    Promise.resolve()
      .then(() => account._parseJSON())
      .catch((error) => {
        debug(error)
        isError(error)
        test.end()
      })
  })

  t.test('Got some string', (test) => {
    const responseText = 'ok'
    const account = getAccount()

    Promise.resolve()
      .then(() => account._parseJSON(responseText))
      .catch((error) => {
        debug(error)

        isErrorSays(error, 'Response is not a JSON')
        test.end()
      })
  })

  t.test('Got response but invalid JSON', (test) => {
    const responseText = 'ok'
    const account = getAccount()

    Promise.resolve()
      .then(() => account._parseJSON(new Response(responseText)))
      .catch((error) => {
        debug(error)
        isError(error)
        test.end()
      })
  })

  t.test('Got JSON', (test) => {
    const responseText = JSON.stringify({ text: 'some text' })
    const account = getAccount()

    Promise.resolve()
      .then(() => account._parseJSON(new Response(responseText)))
      .then((response) => {
        tap.equal(response.text, 'some text')

        return test.end()
      })
      .catch(error => logger.error(error))
  })

  t.end()
})

tap.test('Account._checkStatus', (t) => {
  t.test('Fails as expected on empty response', (test) => {
    const account = getAccount()

    Promise.resolve()
      .then(() => account._checkStatus())
      .catch((error) => {
        debug(error)
        isError(error)
        test.end()
      })
  })

  t.test('Got valid but wrong response (300)', (test) => {
    const response = new Response()
    const account = getAccount()

    response.status = 300

    Promise.resolve()
      .then(() => account._checkStatus(response))
      .catch((error) => {
        debug(error)
        isErrorSays(error, 'OK')
        test.end()
      })
  })

  t.test('Got valid response', (test) => {
    const response = new Response()
    const account = getAccount()

    Promise.resolve()
      .then(() => account._checkStatus(response))
      .then((res) => {
        tap.equal(res.statusText, 'OK')
        tap.equal(res.status, 200)

        return test.end()
      })
      .catch(error => logger.error(error))
  })

  t.end()
})
