import { Provider } from './provider'

class IdP extends Provider {
  constructor (config) {
    if (!config && !config.endpoint) throw new TypeError('Missing `endpoint` in config')

    super()

    this.endpoint = config.endpoint
  }

  accessTokenRequest (authKey, { client_token, grant_type }) {
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!client_token) throw new TypeError(`Incorrect parameters 'client_token': ${client_token}`)
    if (!grant_type) throw new TypeError(`Incorrect parameters 'grant_type': ${grant_type}`)

    const uri = `${this.endpoint}/auth/${authKey}/token`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_token,
        grant_type,
      }),
    })
  }

  refreshAccessTokenRequest (id, refreshToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const uri = `${this.endpoint}/accounts/${id}/refresh`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    })
  }

  revokeRefreshTokenRequest (id, refreshToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const uri = `${this.endpoint}/accounts/${id}/revoke`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    })
  }

  linkRequest (authKey, { client_token, grant_type }, accessToken) {
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!client_token) throw new TypeError(`Incorrect parameters 'client_token': ${client_token}`)
    if (!grant_type) throw new TypeError(`Incorrect parameters 'grant_type': ${grant_type}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/auth/${authKey}/link`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        client_token,
        grant_type,
      }),
    })
  }

  authRequest (id, accessToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}/auth`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }

  unlinkRequest (id, authKey, accessToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}/auth/${authKey}`

    return new Request(uri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }

  accountRequest (id, accessToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }

  removeAccountRequest (id, accessToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}`

    return new Request(uri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }

  isEnabledRequest (id, accessToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}/enabled`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }

  enableRequest (id, accessToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}/enabled`

    return new Request(uri, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }

  disableRequest (id, accessToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}/enabled`

    return new Request(uri, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }
}

export default IdP
