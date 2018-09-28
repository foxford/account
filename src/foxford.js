import Provider from './provider'

class FoxfordIAMProvider extends Provider {
  constructor (config) {
    if (!config && !config.endpoint) throw new TypeError('Missing `endpoint` in config')

    super()

    this.endpoint = config.endpoint
  }

  refreshAccessTokenRequest (id, refreshToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    return new Request(`${this.endpoint}/accounts/${id}/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })
  }

  revokeRefreshTokenRequest (id, refreshToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    return new Request(`${this.endpoint}/accounts/${id}/revoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })
  }
}

export default FoxfordIAMProvider
