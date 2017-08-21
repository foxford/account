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
  accountResponse,
  authResponse,
  myAccountId
} from '../mocks/response-mock'

export default function auth () {
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
}
