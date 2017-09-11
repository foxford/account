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
  myAccountId
} from '../mocks/response-mock'

export default function get () {
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
  after(() => window.localStorage.removeItem(`account_${accountId}`))

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
    account.signIn({ id: accountId })
      .then(account.get(id))
      .then(res => {
        assert.strictEqual(res.id, accountId)
        done()
      })
  })

  it('Return error when pass `undefined`', (done) => {
    account.signIn({ auth_key: authKey, params })
      .then(account.get())
      .catch(err => {
        assert.equal(err instanceof Error, true)
        done()
      })
  })
}
