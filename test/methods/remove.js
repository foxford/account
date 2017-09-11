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
  removeAccountResponse,
  myAccountId
} from '../mocks/response-mock'

export default function remove () {
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
}
