import 'isomorphic-fetch'
import assert from 'assert'
import storageMock from './mocks/storage-mock'
import fetchMock from 'fetch-mock'
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

import Account from '../src/account'
import IdP from '../src/idp'

window.localStorage = storageMock() // imitation of localStorage in node environment

let account = null
const authKey = 'oauth2.key'
const params = {
  client_token: '12345',
  grant_type: 'client_credentials'
}

describe('Account', () => {
  describe('construct', () => {
    it('create instance account', () => {
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' })
      })
      assert.notEqual(account, undefined)
    })
  })

  describe('_checkStatus', () => {
    it('Return error when pass negative values', (done) => {
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
    it('Return error when pass negative values', (done) => {
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))

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
        { refresh_token: '' }
      ]
      const errors = []

      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn(val)
            .catch(err => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Successful response (`authKey` and `params`)', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))
          assert.strictEqual(!!window.localStorage.getItem(`account_${signInId}`), true)
          done()
        })
        .catch(err => done(err))
    })

    it('Successfull response when token expired', (done) => {
      const storage = JSON.parse(window.localStorage.getItem(`account_${signInId}`))
      storage.expires_time = storage.expires_time - (storage.expires_in * 1000) - account.expiresLeeway
      window.localStorage.setItem(`account_${signInId}`, JSON.stringify(storage))

      account.signIn({ auth_key: authKey, params })
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))
          done()
        })
    })

    it('Successfull response (`refresh_token`)', (done) => {
      window.localStorage.removeItem(`account_${signInId}`)
      account.signIn({ refresh_token: signInRefreshToken })
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(refreshResponse))
          done()
        })
    })

    it('Return token data from localStorage', (done) => {
      const account2 = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: signInId
      })

      account2.signIn()
        .then(res => {
          assert.strictEqual(typeof res === 'object', true)
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Return an error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ auth_key: authKey, params })
            .then(account.refresh(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

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

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ auth_key: authKey, params })
            .then(account.revoke(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

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
    after(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [
        undefined,
        null,
        '',
        {},
        { authKey: undefined, params: undefined },
        { authKey: null, params: null },
        { authKey: '', params: '' }
      ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ auth_key: authKey, params })
            .then(account.link(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.link(authKey, linkParams))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(linkResponse))
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ auth_key: authKey, params })
            .then(account.auth(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.auth(myAccountId))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(authResponse))
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ auth_key: authKey, params })
            .then(account.unlink(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.unlink(myAccountId, authKey))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(unLinkResponse))
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ auth_key: authKey, params })
            .then(account.get(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

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
      account.signIn({ auth_key: authKey, params })
        .then(account.get(id))
        .then(res => {
          assert.strictEqual(res.id, signInId)
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ auth_key: authKey, params })
            .then(account.remove(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Successful response', (done) => {
      account.signIn({ auth_key: authKey, params })
        .then(account.remove(id))
        .then(res => {
          assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))
          done()
        })
    })

    it('AccountId from localStorage removed', () => {
      assert.strictEqual(!!window.localStorage.getItem(`account_${signInId}`), false)
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
    afterEach(() => window.localStorage.removeItem(`account_${signInId}`))

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ refresh_token: signInRefreshToken })
            .then(account.isEnabled(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Response 204 (account enabled)', (done) => {
      fetchMock.once(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 204
      }, {
        method: 'GET'
      })
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.isEnabled(signInId))
        .then(data => { done() })
    })

    it('Response 404 (account disabled)', (done) => {
      fetchMock.once(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 404
      }, {
        method: 'GET'
      })
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.isEnabled(signInId))
        .catch((err) => {
          assert.equal(err instanceof Error, true)
          assert.equal(err.response.status, 404)
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 204
      }, {
        method: 'PUT'
      })
    })

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ refresh_token: signInRefreshToken })
            .then(account.enable(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Successfull response (account enabled)', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.enable(signInId))
        .then(data => { done() })
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
    after(() => window.localStorage.removeItem(`account_${signInId}`))
    beforeEach(() => {
      fetchMock.mock(`${account.provider.endpoint}/accounts/${signInId}/enabled`, {
        status: 204
      }, {
        method: 'DELETE'
      })
    })

    it('Return error when pass negative values', (done) => {
      const negativeValues = [ undefined, null, '' ]
      const errors = []
      for (let i = 0; i < negativeValues.length; i++) {
        ((val, counter) => {
          account.signIn({ refresh_token: signInRefreshToken })
            .then(account.disable(val))
            .catch((err) => {
              errors.push(err)
              assert.equal(err instanceof Error, true)
              if (counter === negativeValues.length - 1) {
                assert.equal(errors.length, negativeValues.length)
                done()
              }
            })
        })(negativeValues[i], i)
      }
    })

    it('Successfull response (account disabled)', (done) => {
      account.signIn({ refresh_token: signInRefreshToken })
        .then(account.disable(signInId))
        .then(data => { done() })
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
          assert.strictEqual(window.localStorage.getItem(`account_${signInId}`), null)
          assert.strictEqual(account.id, null)
          done()
        })
    })
  })
})
