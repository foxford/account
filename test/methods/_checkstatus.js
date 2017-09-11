import { account, authKey } from '../initialize'
import assert from 'assert'
import fetchMock from 'fetch-mock'
import { signInResponse } from '../mocks/response-mock'

export default function _parseJSON () {
  it('Return error when pass `undefined`', (done) => {
    try {
      account._checkStatus()
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
    done()
  })

  it('Return response with 200 code', (done) => {
    fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
      body: signInResponse
    }, {
      method: 'POST'
    })
    fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
      .then(account._checkStatus)
      .then(response => {
        assert(response.status, 200)
        done()
      })
  })

  it('Return error (404 code)', (done) => {
    fetchMock.postOnce(`${account.provider.endpoint}/auth/${authKey}/token`, {
      status: 404,
      body: signInResponse
    })
    fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
      .then(account._checkStatus)
      .catch(err => {
        assert.equal(err instanceof Error, true)
        assert.equal(err.response.status, 404)
        done()
      })
  })
}
