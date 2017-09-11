import { account, authKey, params } from '../initialize'
import assert from 'assert'
import fetchMock from 'fetch-mock'
import { signInResponse } from '../mocks/response-mock'

export default function _fetchRetry () {
  it('Return response', (done) => {
    fetchMock.postOnce(`${account.provider.endpoint}/auth/${authKey}/token`, {
      status: 200,
      body: signInResponse
    })

    account._fetchRetry(() => account.provider.accessTokenRequest(authKey, params))
      .then(response => {
        assert(response.status, 200)
        done()
      })
  })
}
