/** @flow */
// import { nvrnt } from './utils/invariant'
// import { saveData, isEnv } from './utils/index'
import { saveData } from './utils/index'

import type { IdP } from './idp'
import type { Label, ClientToken } from './identity-provider.js.flow'
import type { IAbstractStorage as AbstractStorage } from './storage.js.flow'
import type { CallableP, AccountConfig, SignInOptions, TokenData } from './account.js.flow'

type EndpointConfig = {
  endpoint: string,
  accountEndpoint?: string | Function,
  authnEndpoint?: string | Function
}

const MAX_AJAX_RETRY = 3
const AJAX_RETRY_DELAY = 1000
const LEEWAY = 3000

// const debug = nvrnt('account', isEnv(process.env.NODE_ENV))
const debug = x => x

export default class Account<Config: AccountConfig, Storage: AbstractStorage> {
  storage: Storage;

  provider: IdP<EndpointConfig>;

  retries: number;

  retryDelay: number;

  leeway: number;

  label: string;

  id: string | null;

  constructor (config: Config, storage: Storage) {
    if (!config || !config.provider) throw new TypeError('Missing `provider` in config')

    if (!storage) throw new TypeError('Storage is not defined')

    this.storage = storage
    this.provider = config.provider
    this.retries = config.retries || MAX_AJAX_RETRY
    this.retryDelay = config.retryDelay || AJAX_RETRY_DELAY
    this.leeway = config.leeway || LEEWAY

    const { id, label } = this._createLabel(config.audience, config.label)

    this.label = label
    this.id = id
  }

  // eslint-disable-next-line class-methods-use-this
  _createLabel (audience: string, label: string = 'me', separator: string = '.'): { label: string, id: string } {
    if (!audience) throw new TypeError('`audience` is absent')

    return {
      label,
      id: `${label}${separator}${audience}`,
    }
  }

  _getTokenDataP (): Promise<TokenData> {
    return new Promise((resolve, reject) => {
      let item

      if (!this.id) {
        debug('Try to get access to account data but no ID was specified')

        return resolve({})
      }

      try {
        item = this.storage.getItem(`account_${this.id}`)
      } catch (error) {
        return reject(new Error(`Missing account id: ${this.id}`))
      }

      if (!item && typeof item !== 'string') return resolve({})

      try {
        return resolve(JSON.parse(item) || {})
      } catch (error) {
        return reject(new Error('Error occured when parse from account data'))
      }
    })
  }

  /**
   * Check token expire
   */
  _isTokenExpired (data: TokenData): boolean {
    const isExpired = x => !x
    || !x.expires_time
    || Date.now() > (Number(x.expires_time) - this.leeway)

    return isExpired(data)
  }

  /**
   * Does token exist
   *
   * @param {string} [key='access_token']
   * @returns a:?string => a
   * @memberof Account
   */
  _isTokenExist (key: string = 'access_token') { // eslint-disable-line class-methods-use-this
    return (token: ?string) => {
      if (!token) throw new TypeError(`Missing '${key}' in account data`)

      return token
    }
  }

  /**
   * Get access token
   */
  signIn (options: SignInOptions): Promise<*> {
    const fetchToken = (authKey, params: ClientToken) => this._getTokenDataP()
      .then(data => (this._isTokenExpired(data) || !this.id)
        ? this._fetchToken(authKey, params)
        : data)

    const refreshToken = (token: string) => this._getTokenDataP()
      .then(data => (this._isTokenExpired(data) || !this.id)
        ? this._fetchRefreshToken(this.label, token)
        : data)

    const getTokenDataById = () => this._getTokenDataP()
      .then(tokenData => this._isTokenExpired(tokenData)
        ? this._fetchRefreshToken(this.label, tokenData.refresh_token)
        : tokenData)

    if (
      options
      && options.auth_key
      && options.params
      && options.params.client_token
      && options.params.grant_type
    ) {
      return fetchToken(options.auth_key, options.params)
    } if (options && options.data) {
      this._saveTokenData(options.data)

      return getTokenDataById()
    } if (options && options.refresh_token) {
      return refreshToken(options.refresh_token)
    } if (!options && this.id) {
      return getTokenDataById()
    }

    return Promise.reject(new TypeError('Missing required options:  pair `authKey`, `params` or `refresh_token` or missing token data'))
  }

  /**
   * Refresh access token
   * @param {*} id
   */
  refresh (id: string): () => Promise<*> {
    return () => {
      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)

      return this._getTokenDataP()
        .then(({ refresh_token }) => this._isTokenExist('refresh_token')(refresh_token))
        .then(token => this._fetchRefreshToken(id, token))
    }
  }

  /**
   * Revoke refresh token
   * @param {*} id
   */
  revoke (label: Label): CallableP<Promise<*>> {
    return () => {
      if (!label) throw new TypeError('Incorrect parameter `label`')

      return this._getTokenDataP()
        .then(({ refresh_token }) => this._isTokenExist('refresh_token')(refresh_token))
        .then(token => this
          ._fetchRetry(() => this.provider.revokeRefreshTokenRequest(label, token)))
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then((res) => {
          this._saveTokenData(res)

          return res
        })
    }
  }

  /**
   * Get account info
   * @param {*} id
   */
  get (label: Label): CallableP<Promise<*>> {
    return () => {
      if (!label) throw new TypeError('Incorrect parameter `label`')

      return this._getTokenDataP()
        .then(({ access_token }) => this._isTokenExist()(access_token))
        .then(token => this._fetchRetry(() => this.provider.accountRequest(label, token)))
        .then(this._checkStatus)
        .then(this._parseJSON)
    }
  }

  /**
   * Delete access token
   */
  signOut (): Promise<void> {
    if (this.id) {
      this.storage.removeItem(`account_${this.id}`)
      this.id = null

      return Promise.resolve()
    }
    throw new ReferenceError(`Missing account id: ${this.id || ''}`)
  }

  /**
   * Save token data
   * @param {*} data
   */
  _saveTokenData (data: TokenData = {}): void {
    const {
      access_token, refresh_token, expires_in,
    } = data

    this._getTokenDataP()
      .then((_data) => {
        const tokenData = _data

        if (access_token) tokenData.access_token = access_token

        if (refresh_token) tokenData.refresh_token = refresh_token

        if (expires_in) {
          tokenData.expires_in = expires_in
          tokenData.expires_time = Date.now() + ((Number(expires_in) || 0) * 1000)
        }

        if (!this.id) throw new Error('`id` is absent')

        this.storage.setItem(`account_${this.id}`, JSON.stringify(tokenData))

        return true
      })
      .catch((error) => {
        throw new Error(error.message || 'Can\'t save the token data')
      })
  }

  /**
   * Fetch access token
   */
  _fetchToken (authKey: string, params: ClientToken): Promise<*> {
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!params) throw new TypeError(`Incorrect parameter 'params': ${params}`)

    const fetchAccount = data => this._fetchRetry(() => this.provider
      .accountRequest(this.label, data.access_token))
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then((res) => {
        this.id = res.id
        this._saveTokenData(data)

        return data
      })

    return this._fetchRetry(() => this.provider.accessTokenRequest(authKey, params))
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then((data) => {
        if (!this.id) {
          return fetchAccount(data)
        }
        this._saveTokenData(data)

        return data
      })
  }

  /**
   * Fetch refresh token
   */
  _fetchRefreshToken (label: string, refreshToken: string = ''): Promise<*> {
    if (!label) throw new TypeError('Incorrect parameter `label`')
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const fetchAccount = data => this._fetchRetry(() => this.provider
      .accountRequest(this.label, data.access_token))
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then((res) => {
        this.id = res.id

        saveData(tokenData => this._saveTokenData(tokenData), data)

        return data
      })

    return this._fetchRetry(() => this.provider.refreshAccessTokenRequest(label, refreshToken))
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then((data) => {
        if (!this.id) return fetchAccount(data)

        saveData(tokenData => this._saveTokenData(tokenData), data)

        return data
      })
  }

  /**
   * Fetch with retry logic
   * @param {*} requestFn
   */
  _fetchRetry (requestFn: Function): Promise<Response> {
    if (!requestFn) throw new TypeError(`Missing 'requestFn': ${requestFn}`)

    return new Promise((resolve, reject) => {
      const errors = []

      const wrappedFetch = (n) => {
        if (n < 1) {
          reject(errors)
        } else {
          fetch(requestFn())
            .then(response => resolve(response))
            .catch((error) => {
              errors.push(error)
              setTimeout(() => {
                wrappedFetch(n - 1) // eslint-disable-line no-param-reassign
              }, this.retryDelay)
            })
        }
      }

      wrappedFetch(this.retries)
    })
  }

  /**
   * Check http status and retrurn response or response with error
   * @param {*} response
   */
  // eslint-disable-next-line class-methods-use-this
  _checkStatus (response: Response): Promise<Response> {
    return new Promise((resolve, reject) => {
      if (!response) return reject(new TypeError(`Missing the 'response': ${response}`))

      if (response.status && response.status >= 200 && response.status < 300) {
        return resolve(response)
      }

      const error = new Error(response.statusText || `Invalid request. Status: ${response.status}`)

      // $FlowFixMe
      error.response = response
      // TODO: We should not add smth to an error object. Have to change this weird behaviour

      return reject(error)
    })
  }

  /**
   * Parse response to JSON
   * @param {*} response
   */
  // eslint-disable-next-line class-methods-use-this
  _parseJSON (response: Response | '' = ''): Promise<Object> {
    if (!response) throw new TypeError(`Missing 'response': ${response}`)

    try {
      return response.json()
    } catch (error) {
      throw new Error('Response is not a JSON')
    }
  }
}

export { Account }
