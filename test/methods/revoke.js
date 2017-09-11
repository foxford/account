import {
  account,
  authKey,
  params
} from '../initialize'
import fetchMock from 'fetch-mock'
import assert from 'assert'
import {
  signInResponse,
  accountResponse,
  revokeResponse,
  myAccountId,
  signInId
} from '../mocks/response-mock'

export default function revoke () {
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
}
