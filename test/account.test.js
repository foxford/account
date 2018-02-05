/* eslint promise/no-callback-in-promise: 0 */
import 'isomorphic-fetch'
import assert from 'assert'
import fetchMock from 'fetch-mock'
import pino from 'pino'

import { Account } from '../src/account'
import { IdP } from '../src/idp'

import storageMock from './mocks/storage-mock'
import {
  signInResponse,
  signInRefreshToken,
  myAccountId,
  accountResponse,
  refreshResponse,
  revokeResponse,
  linkResponse,
  linkParams,
  authResponse,
  unLinkResponse,
  removeAccountResponse,
  signInId,
} from './mocks/response-mock'

const logger = pino()

const allErrors = list => list.map(next => assert.ok(next instanceof Error, false))

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

// window.localStorage = storageMock() // imitation of localStorage in node environment
const storage = storageMock()

let account = null

const authKey = 'oauth2.key'
const params = {
  client_token: '12345',
  grant_type: 'client_credentials',
}

const logError = error => logger.error(error)

describe('Promise.all errors', () => {
  it('Handle multiple negative requests', (done) => {
    const negative = () => Promise.reject(new Error('Error'))

    PromiseAllErrors(negative, [1, 2, 3])
      .then(allErrors)
      .then(() => done())
      .catch(logError)
  })

  it('Can\'t handle any positive request', (done) => {
    const maybePositive = value => value === 2
      ? Promise.resolve(true)
      : Promise.reject(new Error('Error'))

    PromiseAllErrors(maybePositive, [1, 2, 3])
      .catch(() => {
        assert.ok('Failed')
        done()
      })
  })
})

describe('Account', () => {
  describe('construct', () => {
    it('create instance account', () => {
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
      }, storage)
      assert.notEqual(account, undefined)
    })
  })

  describe('_checkStatus', () => {
    it('Return error when pass negative values', (done) => {
      account._checkStatus()
        .catch((error) => {
          assert.equal(error instanceof Error, true)
          done()
        })
    })

    it('Return response with 200 code', (done) => {
      fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
        .then(account._checkStatus)
        .then((response) => {
          assert(response.status, 200)

          return done()
        })
        .catch((error) => {
          logger.error(error)
          done()
        })
    })

    it('Return error (404 code)', (done) => {
      fetchMock.postOnce(`${account.provider.endpoint}/auth/${authKey}/token`, {
        status: 404,
        body: signInResponse,
      })
      fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
        .then(account._checkStatus)
        .catch((error) => {
          assert.equal(error instanceof Error, true)
          assert.equal(error.response.status, 404)
          done()
        })
    })
  })

  describe('_parseJSON', () => {
    it('Return error when pass negative values', (done) => {
      try {
        account._parseJSON()
      } catch (error) {
        assert.equal(error instanceof Error, true)
      }
      done()
    })

    it('Return json object', (done) => {
      fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })

      fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
        .then(account._parseJSON)
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))

          return done()
        })
        .catch((error) => {
          logger.error(error)
          done()
        })
    })
  })

  describe('signIn', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse,
      }, {
        methods: 'POST',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return an error when pass negative values', (done) => {
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
        .then(() => done())
        .catch(logError)
    })

    it('Successful response (`authKey` and `params`)', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))
          assert.strictEqual(!!storage.getItem(`account_${signInId}`), true)

          return done()
        })
        .catch(error => logger.error(error))
    })

    it('Successfull response when token expired', (done) => {
      const store = JSON.parse(storage.getItem(`account_${signInId}`))

      store.expires_time = store.expires_time -
        (store.expires_in * 1000) -
        account.expiresLeeway
      storage.setItem(`account_${signInId}`, JSON.stringify(store))

      account.signIn({ auth_key: authKey, params })
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))

          return done()
        })
        .catch(logError)
    })

    it('Successfull response (`refresh_token`)', (done) => {
      storage.removeItem(`account_${signInId}`)
      account.signIn({ refresh_token: signInRefreshToken })
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(refreshResponse))

          return done()
        })
        .catch(logError)
    })

    it('Return token data from localStorage', (done) => {
      const account2 = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: signInId,
      }, storage)

      account2.signIn()
        .then((res) => {
          assert.strictEqual(typeof res === 'object', true)

          return done()
        })
        .catch(logError)
    })
  })

  describe('refresh', () => {
    const responseResult = refreshResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}/refresh`, {
        body: responseResult,
      }, {
        methods: 'POST',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return an error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ auth_key: authKey, params })
          .then(account.refresh(val))
        , negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch((error) => {
          assert.fail(error)
          done()
        })
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.refresh(id))
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))

          return done()
        })
        .catch(logError)
    })

    it('Access token from response equal access token from localStorage', () => {
      const accessToken = JSON.parse(storage.getItem(`account_${signInId}`)).access_token

      assert.strictEqual(responseResult.access_token, accessToken)
    })
  })

  describe('revoke', () => {
    const responseResult = revokeResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}/revoke`, {
        body: responseResult,
      }, {
        method: 'POST',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ auth_key: authKey, params })
          .then(account.revoke(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.revoke(id))
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))

          return done()
        })
        .catch(logError)
    })

    it('Refresh token from response equal refresh token from localStorage', () => {
      const refreshToken = JSON.parse(storage.getItem(`account_${signInId}`)).refresh_token

      assert.strictEqual(responseResult.refresh_token, refreshToken)
    })
  })

  describe('link', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/link`, {
        body: linkResponse,
      }, {
        method: 'POST',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [
        undefined,
        null,
        '',
        {},
        { authKey: undefined, params: undefined },
        { authKey: null, params: null },
        { authKey: '', params: '' },
      ]

      PromiseAllErrors(
        val => account
          .signIn({ auth_key: authKey, params })
          .then(account.link(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.link(authKey, linkParams))
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(linkResponse))

          return done()
        })
        .catch(logError)
    })
  })

  describe('auth', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/auth`, {
        body: authResponse,
      }, {
        method: 'GET',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ auth_key: authKey, params })
          .then(account.auth(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.auth(myAccountId))
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(authResponse))

          return done()
        })
        .catch(logError)
    })
  })

  describe('unlink', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/auth/${authKey}`, {
        body: unLinkResponse,
      }, {
        method: 'DELETE',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ auth_key: authKey, params })
          .then(account.unlink(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.unlink(myAccountId, authKey))
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(unLinkResponse))

          return done()
        })
        .catch(logError)
    })
  })

  describe('get', () => {
    const responseResult = accountResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: responseResult,
      }, {
        method: 'GET',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ auth_key: authKey, params })
          .then(account
            .get(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('AccountId from `signIn` equal accountId from `get`', (done) => {
      let responseId = null

      account.signIn({ auth_key: authKey, params })
        .then((res) => {
          responseId = res.id

          return account.get(id)
        })
        .then((res) => {
          assert.strictEqual(res.id, responseId)

          return done()
        })
        .catch(logError)
    })

    it('AccountId from localStorage equal accountId from `get`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.get(id))
        .then((res) => {
          assert.strictEqual(res.id, signInId)

          return done()
        })
        .catch(logError)
    })
  })

  describe('remove', () => {
    const responseResult = removeAccountResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: responseResult,
      }, {
        method: 'DELETE',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ auth_key: authKey, params })
          .then(account
            .remove(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.remove(id))
        .then((res) => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))

          return done()
        })
        .catch(logError)
    })

    it('AccountId from localStorage removed', () => {
      assert.strictEqual(!!storage.getItem(`account_${signInId}`), false)
    })
  })

  describe('isEnabled', () => {
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse,
      }, {
        methods: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
    })
    afterEach(() => storage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ refresh_token: signInRefreshToken })
          .then(account
            .isEnabled(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Response 204 (account enabled)', (done) => {
      fetchMock.once(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 204,
      }, {
        method: 'GET',
      })
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.isEnabled(signInId))
        .then(() => done())
        .catch(logError)
    })

    it('Response 404 (account disabled)', (done) => {
      fetchMock.once(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 404,
      }, {
        method: 'GET',
      })
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.isEnabled(signInId))
        .catch((error) => {
          assert.equal(error instanceof Error, true)
          assert.equal(error.response.status, 404)
          done()
        })
    })
  })

  describe('enable', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse,
      }, {
        methods: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 204,
      }, {
        method: 'PUT',
      })
    })

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ refresh_token: signInRefreshToken })
          .then(account
            .enable(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Successfull response (account enabled)', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.enable(signInId))
        .then(() => done())
        .catch(logError)
    })
  })

  describe('disable', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse,
      }, {
        methods: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
    })
    after(() => storage.removeItem(`account_${signInId}`))
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 204,
      }, {
        method: 'DELETE',
      })
    })

    it('Return error when pass negative values', (done) => {
      const negativeValues = [undefined, null, '']

      PromiseAllErrors(
        val => account
          .signIn({ refresh_token: signInRefreshToken })
          .then(account.disable(val)),
        negativeValues
      )
        .then(allErrors)
        .then(() => done())
        .catch(logError)
    })

    it('Successfull response (account disabled)', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.disable(signInId))
        .then(() => done())
        .catch(logError)
    })
  })

  describe('signOut', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse,
      }, {
        method: 'POST',
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse,
      }, {
        method: 'GET',
      })
    })

    it('Initial state have been set (localStorage item, account.id)', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(() => account.signOut())
        .then(() => {
          assert.strictEqual(storage.getItem(`account_${signInId}`), null)
          assert.strictEqual(account.id, null)

          return done()
        })
        .catch(logError)
    })
  })
})
