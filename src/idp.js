/** @flow */
import type {
  AccountProvider,
  ClientToken,
  Request,
  Token,
  Id,
} from './identity-provider.js.flow'

type EndpointConfig = { endpoint: string }

export class IdP<Config: EndpointConfig> implements AccountProvider {
  endpoint: string;

  constructor (config: Config) {
    if (!config && !config.endpoint) throw new TypeError('Missing `endpoint` in config')

    this.endpoint = config.endpoint
  }

  accessTokenRequest (authKey: string, token: ClientToken): Request {
    const { client_token, grant_type } = token
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!client_token) throw new TypeError(`Incorrect parameters 'client_token': ${client_token}`)
    if (!grant_type) throw new TypeError(`Incorrect parameters 'grant_type': ${grant_type}`)

    const uri = `${this.endpoint}/auth/${authKey}/token`

    return new window.Request(uri, {
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

    return new window.Request(uri, {
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

    return new window.Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    })
  }

  accountRequest (id: Id, accessToken: Token) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.endpoint}/accounts/${id}`

    return new window.Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }
}
