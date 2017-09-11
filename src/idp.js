import Provider from './provider'

class IdP extends Provider {
  constructor (config) {
    super()

    this.endpoint = config && config.endpoint

    if (!this.endpoint) throw new TypeError('cannot find `endpoint` in config')
  }

  accessTokenRequest (authKey, params) {
    if (!authKey) throw new TypeError('incorrect parameter `authKey`')
    if (!params) throw new TypeError('incorrect parameter `params`')

    const uri = `${this.endpoint}/auth/${authKey}/token`
    const { client_token, grant_type } = params

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_token,
        grant_type
      })
    })
  }

  refreshAccessTokenRequest (id, refreshToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!refreshToken) throw new TypeError('incorrect parameter `refreshToken`')

    const uri = `${this.endpoint}/accounts/${id}/refresh`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })
  }

  revokeRefreshTokenRequest (id, refreshToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!refreshToken) throw new TypeError('incorrect parameter `refreshToken`')

    const uri = `${this.endpoint}/accounts/${id}/revoke`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })
  }

  linkRequest (authKey, params, accessToken) {
    if (!authKey) throw new TypeError('incorrect parameter `authKey`')
    if (!params) throw new TypeError('incorrect parameter `params`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/auth/${authKey}/link`
    const { client_token, grant_type } = params

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        client_token,
        grant_type
      })
    })
  }

  authRequest (id, accessToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/accounts/${id}/auth`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  unlinkRequest (id, authKey, accessToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!authKey) throw new TypeError('incorrect parameter `authKey`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/accounts/${id}/auth/${authKey}`

    return new Request(uri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  accountRequest (id, accessToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/accounts/${id}`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  removeAccountRequest (id, accessToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/accounts/${id}`

    return new Request(uri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  isEnabledRequest (id, accessToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/accounts/${id}/enabled`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  enableRequest (id, accessToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/accounts/${id}/enabled`

    return new Request(uri, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  disableRequest (id, accessToken) {
    if (!id) throw new TypeError('incorrect parameter `id`')
    if (!accessToken) throw new TypeError('incorrect parameter `accessToken`')

    const uri = `${this.endpoint}/accounts/${id}/enabled`

    return new Request(uri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }
}

export default IdP
