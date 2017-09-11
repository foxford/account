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

export default function enable () {
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
}
