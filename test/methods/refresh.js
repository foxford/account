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
  accountResponse,
  refreshResponse,
  signInId
} from '../mocks/response-mock'

export default function refresh () {
  const responseResult = refreshResponse
  const id = myAccountId

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
    fetchMock.mock(`${account.provider.endpoint}/accounts/${id}/refresh`, {
      body: responseResult
    }, {
      methods: 'POST'
    })
  })
  after(() => window.localStorage.removeItem(`account_${accountId}`))

  it('Successful response', (done) => {
    account.signIn({ auth_key: authKey, params })
      .then(account.refresh(id))
      .then(res => {
        assert.strictEqual(JSON.stringify(res), JSON.stringify(responseResult))
        done()
      })
  })

  it('Access token from response equal access token from localStorage', () => {
    const accessToken = JSON.parse(window.localStorage.getItem(`account_${signInId}`)).access_token

    assert.strictEqual(responseResult.access_token, accessToken)
  })

  it('Return an error when pass `undefined`', (done) => {
    account.signIn({ auth_key: authKey, params })
      .then(account.refresh())
      .catch((err) => {
        assert.equal(err instanceof Error, true)
        done()
      })
  })
}
