/** @flow */
import type {
  EndpointConfig,
  Provider,
  Token,
  Label,
} from './identity-provider.js.flow'

export class IdP<Config: EndpointConfig> implements Provider {
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
        : (conf.authnEndpoint || `${this.endpoint}/authn`)
    }

    this.endpoint = config.endpoint
    this.accountEndpoint = _accountEndpoint(config)
    this.authnEndpoint = _authnEndpoint(config)
  }

  refreshAccessToken (label: Label, refreshToken: Token): Request {
    if (!label) throw new TypeError('Incorrect parameter `label`')
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const uri = `${this.accountEndpoint}/${label}/refresh`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    })
  }

  revokeRefreshToken (label: Label, refreshToken: Token): Request {
    if (!label) throw new TypeError('Incorrect parameter `label`')
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const uri = `${this.accountEndpoint}/${label}/revoke`

    return new Request(uri, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    })
  }

  account (label: Label, accessToken: Token): Request {
    if (!label) throw new TypeError('Incorrect parameter `label`')
    if (!accessToken) throw new TypeError(`Incorrect parameter 'accessToken': ${accessToken}`)

    const uri = `${this.authnEndpoint}/${label}`

    return new Request(uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }
}
