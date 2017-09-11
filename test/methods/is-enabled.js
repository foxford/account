import {
  account,
  accountId
} from '../initialize'
import fetchMock from 'fetch-mock'
import assert from 'assert'
import {
  refreshResponse,
  signInRefreshToken,
  accountResponse,
  myAccountId
} from '../mocks/response-mock'

export default function isEnabled () {
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
}
