import {
  account,
  accountId
} from '../initialize'
import fetchMock from 'fetch-mock'
import assert from 'assert'
import {
  accountResponse,
  signInRefreshToken,
  refreshResponse,
  myAccountId
} from '../mocks/response-mock'

export default function disable () {
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
}
