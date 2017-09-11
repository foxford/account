import {
  account,
  authKey,
  params,
  accountId
} from '../initialize'
import fetchMock from 'fetch-mock'
import assert from 'assert'
import {
  signInResponse,
  signInRefreshToken,
  myAccountId,
  accountResponse,
  refreshResponse
} from '../mocks/response-mock'

export default function signIn () {
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
}
