import storageMock from './mocks/storage-mock'
import es6Promise from 'es6-promise'
import 'isomorphic-fetch'

import assert from 'assert'
import fetchMock from 'fetch-mock'
import {
  account,
  authKey,
  params,
  accountId
} from './initialize'
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
  signInId
} from './mocks/response-mock'

es6Promise.polyfill()
window.localStorage = storageMock()

describe('Account', () => {
  describe('_checkStatus', () => {
    it('Return error when pass `undefined`', (done) => {
      try {
        account._checkStatus()
      } catch (err) {
        assert.equal(err instanceof Error, true)
      }
      done()
    })

    it('Return response with 200 code', (done) => {
      fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
        .then(account._checkStatus)
        .then(response => {
          assert(response.status, 200)
          done()
        })
    })

    it('Return error (404 code)', (done) => {
      fetchMock.postOnce(`${account.provider.endpoint}/auth/${authKey}/token`, {
        status: 404,
        body: signInResponse
      })
      fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
        .then(account._checkStatus)
        .catch(err => {
          assert.equal(err instanceof Error, true)
          assert.equal(err.response.status, 404)
          done()
        })
    })
  })

  describe('_parseJSON', () => {
    it('Return error when pass `undefined`', (done) => {
      try {
        account._parseJSON()
      } catch (err) {
        assert.equal(err instanceof Error, true)
      }
      done()
    })

    it('Return json object', (done) => {
      fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
        .then(account._parseJSON)
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))
          done()
        })
    })
  })

  describe('_fetchRetry', () => {
    it('Return response', (done) => {
      fetchMock.postOnce(`${account.provider.endpoint}/auth/${authKey}/token`, {
        status: 200,
        body: signInResponse
      })

      account._fetchRetry(() => account.provider.accessTokenRequest(authKey, params))
        .then(response => {
          assert(response.status, 200)
          done()
        })
    })
  })

  describe('signIn', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse
      }, {
        methods: 'POST'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))

    it('Successful response (`authKey` and `params`)', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))
          done()
        })
        .catch(err => done(err))
    })

    it('Item saved in localStorage', () => {
      assert.strictEqual(!!window.localStorage.getItem(`account_${accountId}`), true)
    })

    it('Succesful response from localStorage (`accountId`)', (done) => {
      account.signIn({ id: accountId })
        .then(res => {
          assert.strictEqual(typeof res === 'object', true)
          done()
        })
    })

    it('Successfull response when token expired', (done) => {
      const storage = JSON.parse(window.localStorage.getItem(`account_${accountId}`))
      storage.expires_time = storage.expires_time - (storage.expires_in * 1000) - account.expiresLeeway
      window.localStorage.setItem(`account_${accountId}`, JSON.stringify(storage))

      account.signIn({ id: accountId })
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(refreshResponse))
          done()
        })
    })

    it('Successfull response (`refresh_token`)', (done) => {
      window.localStorage.removeItem(`account_${accountId}`)
      account.signIn({ refresh_token: signInRefreshToken })
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(refreshResponse))
          done()
        })
    })

    it('Return an error when pass `undefined`', (done) => {
      account.signIn()
        .catch((err) => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('refresh', () => {
    const responseResult = refreshResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}/refresh`, {
        body: responseResult
      }, {
        methods: 'POST'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.refresh(id))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))
          done()
        })
    })

    it('Access token from response equal access token from localStorage', () => {
      const accessToken = JSON.parse(window.localStorage.getItem(`account_${signInId}`)).access_token

      assert.strictEqual(responseResult.access_token, accessToken)
    })

    it('Return an error when pass `undefined`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.refresh())
        .catch((err) => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('revoke', () => {
    const responseResult = revokeResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}/revoke`, {
        body: responseResult
      }, {
        method: 'POST'
      })
    })
    after(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.revoke(id))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))
          done()
        })
    })

    it('Refresh token from response equal refresh token from localStorage', () => {
      const refreshToken = JSON.parse(window.localStorage.getItem(`account_${signInId}`)).refresh_token

      assert.strictEqual(responseResult.refresh_token, refreshToken)
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.revoke())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('link', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/link`, {
        body: linkResponse
      }, {
        method: 'POST'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.link(authKey, linkParams))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(linkResponse))
          done()
        })
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.link())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('auth', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/auth`, {
        body: authResponse
      }, {
        method: 'GET'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.auth(myAccountId))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(authResponse))
          done()
        })
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.auth())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('unlink', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/auth/${authKey}`, {
        body: unLinkResponse
      }, {
        method: 'DELETE'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.unlink(myAccountId, authKey))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(unLinkResponse))
          done()
        })
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.unlink())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('get', () => {
    const responseResult = accountResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: responseResult
      }, {
        method: 'GET'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))

    it('AccountId from `signIn` equal accountId from `get`', (done) => {
      let responseId = null
      account.signIn({ auth_key: authKey, params })
        .then(res => {
          responseId = res.id
          return account.get(id)
        })
        .then(res => {
          assert.strictEqual(res.id, responseId)
          done()
        })
    })

    it('AccountId from localStorage equal accountId from `get`', (done) => {
      account.signIn({ id: accountId })
        .then(account.get(id))
        .then(res => {
          assert.strictEqual(res.id, accountId)
          done()
        })
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.get())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('remove', () => {
    const responseResult = removeAccountResponse
    const id = myAccountId

    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${id}`, {
        body: responseResult
      }, {
        method: 'DELETE'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.remove(id))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))
          done()
        })
    })

    it('AccountId from localStorage removed', () => {
      assert.strictEqual(!!window.localStorage.getItem(`account_${accountId}`), false)
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.remove())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('isEnabled', () => {
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse
      }, {
        methods: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
    })
    afterEach(() => window.localStorage.removeItem(`account_${accountId}`))

    it('Response 204 (account enabled)', (done) => {
      fetchMock.once(`${account.provider.endpoint}/accounts/${accountId}/enabled`, {
        status: 204
      }, {
        method: 'GET'
      })
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.isEnabled(accountId))
        .then(data => { done() })
    })

    it('Response 404 (account disabled)', (done) => {
      fetchMock.once(`${account.provider.endpoint}/accounts/${accountId}/enabled`, {
        status: 404
      }, {
        method: 'GET'
      })
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.isEnabled(accountId))
        .catch((err) => {
          assert.equal(err instanceof Error, true)
          assert.equal(err.response.status, 404)
          done()
        })
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.isEnabled())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('enable', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse
      }, {
        methods: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${accountId}/enabled`, {
        status: 204
      }, {
        method: 'PUT'
      })
    })

    it('Successfull response (account enabled)', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.enable(accountId))
        .then(data => { done() })
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.enable())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('disable', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}/refresh`, {
        body: refreshResponse
      }, {
        methods: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
    })
    after(() => window.localStorage.removeItem(`account_${accountId}`))
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${accountId}/enabled`, {
        status: 204
      }, {
        method: 'DELETE'
      })
    })

    it('Successfull response (account disabled)', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.disable(accountId))
        .then(data => { done() })
    })

    it('Return error when pass `undefined`', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.disable())
        .catch(err => {
          assert.equal(err instanceof Error, true)
          done()
        })
    })
  })

  describe('signOut', () => {
    before(() => {
      fetchMock.mock(`${account.provider.endpoint}/auth/${authKey}/token`, {
        body: signInResponse
      }, {
        method: 'POST'
      })
      fetchMock.mock(`${account.provider.endpoint}/accounts/${myAccountId}`, {
        body: accountResponse
      }, {
        method: 'GET'
      })
    })

    it('Initial state have been set (localStorage item, account.id)', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(() => account.signOut())
        .then(() => {
          assert.strictEqual(window.localStorage.getItem(`account_${accountId}`), null)
          assert.strictEqual(account.id, null)
          done()
        })
    })
  })
})
