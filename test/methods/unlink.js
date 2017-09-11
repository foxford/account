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
  myAccountId,
  unLinkResponse
} from '../mocks/response-mock'

export default function unlink () {
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
}
