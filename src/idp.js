/** @flow */
import type {
  AccountProvider,
  ClientToken,
  Token,
  Id,
} from './identity-provider.js.flow'

type EndpointConfig = {
  endpoint: string,
  accountEndpoint?: string | Function,
  authnEndpoint?: string | Function
}

export class IdP<Config: EndpointConfig> implements AccountProvider {
  endpoint: string;

  accountEndpoint: string;

  authnEndpoint: string;

  constructor (config: Config) {
    if (!config) throw new TypeError('Missing provider configuration')

    const _accountEndpoint: Function = (conf: Config) => {
      if (!this.endpoint && !conf.accountEndpoint) throw new TypeError('Can not resolve account endpoint')

      return conf.accountEndpoint && typeof conf.accountEndpoint === 'function'
        ? conf.accountEndpoint()
        : (conf.accountEndpoint || `${this.endpoint}/accounts`)
    }

    const _authnEndpoint: Function = (conf: Config) => {
      if (!this.endpoint && !conf.authnEndpoint) throw new TypeError('Can not resolve authentication endpoint')

      return conf.authnEndpoint && typeof conf.authnEndpoint === 'function'
        ? conf.authnEndpoint()
        : (conf.authnEndpoint || `${this.endpoint}/auth`)
    }

    this.endpoint = config.endpoint
    this.accountEndpoint = _accountEndpoint(config)
    this.authnEndpoint = _authnEndpoint(config)
  }

  accessTokenRequest (authKey: string, token: ClientToken): TRequest {
    const { client_token, grant_type } = token
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!client_token) throw new TypeError(`Incorrect parameters 'client_token': ${client_token}`)
    if (!grant_type) throw new TypeError(`Incorrect parameters 'grant_type': ${grant_type}`)

    const uri = `${this.authnEndpoint}/${authKey}/token`

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

  refreshAccessTokenRequest (id: Id, refreshToken: Token): TRequest {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const uri = `${this.accountEndpoint}/${id}/refresh`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    })
  }

  revokeRefreshTokenRequest (id: Id, refreshToken: Token): TRequest {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const uri = `${this.accountEndpoint}/${id}/revoke`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    })
  }

  accountRequest (id: Id, accessToken: Token): TRequest {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.accountEndpoint}/${id}`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }
}
