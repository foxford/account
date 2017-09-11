import { account, authKey } from '../initialize'
import assert from 'assert'
import fetchMock from 'fetch-mock'
import { signInResponse } from '../mocks/response-mock'

export default function _parseJSON () {
  it('Return error when pass `undefined`', (done) => {
    try {
      account._parseJSON()
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
    done()
  })

  it('Return json object', (done) => {
    fetchMock.once(`${account.provider.endpoint}/auth/${authKey}/token`, {
      body: signInResponse
    }, {
      method: 'POST'
    })
    fetch(`${account.provider.endpoint}/auth/${authKey}/token`, { method: 'POST' })
      .then(account._parseJSON)
      .then(res => {
        assert.strictEqual(JSON.stringify(res), JSON.stringify(signInResponse))
        done()
      })
  })
}
