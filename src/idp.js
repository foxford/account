/** @flow */
import type { AccountProvider, Id, Key, Token, ClientToken, EndpointConfig } from './provider.js.flow'

export default class IdP<Config: EndpointConfig> implements AccountProvider {
  endpoint: string;

  constructor (config: Config) {
    if (!config && !config.endpoint) throw new TypeError('Missing `endpoint` in config')

    this.endpoint = config.endpoint
  }

  accessTokenRequest (authKey: Key, { client_token, grant_type }: ClientToken) {
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

  refreshAccessTokenRequest (id: Id, refreshToken: Token) {
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

  revokeRefreshTokenRequest (id: Id, refreshToken: Token) {
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

  linkRequest (
    authKey: Key,
    { client_token, grant_type }: ClientToken,
    accessToken: Token
  ) {
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

  authRequest (id: Id, accessToken: Token) {
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

  unlinkRequest (id: Id, authKey: Key, accessToken: Token) {
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

  accountRequest (id: Id, accessToken: Token) {
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

  removeAccountRequest (id: Id, accessToken: Token) {
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

  isEnabledRequest (id: Id, accessToken: Token) {
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

  enableRequest (id: Id, accessToken: Token) {
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

  disableRequest (id: Id, accessToken: Token) {
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

export { IdP }
