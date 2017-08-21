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
  myAccountId,
  accountResponse
} from '../mocks/response-mock'

export default function signOut () {
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

  it('Initial state have been set (localStorage item, account.id, account._refreshToken)', (done) => {
    account.signIn({ auth_key: authKey, params })
      .then(() => account.signOut())
      .then(() => {
        assert.strictEqual(window.localStorage.getItem(`account_${accountId}`), null)
        assert.strictEqual(account.id, null)
        assert.strictEqual(account._refreshToken, null)
        done()
      })
  })
}
