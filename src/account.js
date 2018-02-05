/** @flow */
import { nvrnt } from './utils/invariant'
import { saveData, isEnv } from './utils/index'

import type
{
  RespP, CallableP,
  AbstractStorage, AccountConfig,
  SignInOptions, TokenData,
} from './account.js.flow'
// $FlowFixMe
import typeof { Provider } from './provider'

const MAX_AJAX_RETRY = 3
const AJAX_RETRY_DELAY = 1000
const LEEWAY = 3000
const MY_ACCOUNT_ID = 'me'

const debug = nvrnt('account', isEnv(process.env.NODE_ENV))

export default class Account {
  provider: Provider;
  storage: AbstractStorage;

  retries: number;
  retryDelay: number;
  leeway: number;
  myAccountId: string;
  id: string | null;

  static get version (): string {
    return __VERSION__
  }

  constructor (config: AccountConfig, storage: AbstractStorage) {
    if (!config || !config.provider) throw new TypeError('Missing `provider` in config')

    if (!storage) throw new TypeError('Storage is not defined')

    this.storage = storage
    this.provider = config.provider
    this.retries = config.retries || MAX_AJAX_RETRY
    this.retryDelay = config.retryDelay || AJAX_RETRY_DELAY
    this.leeway = config.leeway || LEEWAY
    this.myAccountId = config.myAccountId || MY_ACCOUNT_ID
    this.id = config.id || null
  }

  /**
   * Get token data
   */
  _getTokenData (): TokenData {
    let item

    if (!this.id) {
      debug('Try to get access to account data but no ID was specified')

      return {}
    }

    try {
      item = this.storage.getItem(`account_${this.id}`)
    } catch (error) { throw new Error(`Missing account id: ${this.id || ''}`) }

    if (!item && typeof item !== 'string') {
      debug('There is and error while parsing token data')

      return {}
    }

    try {
      return JSON.parse(item) || {}
    } catch (error) { throw new Error('Error occured when parse from account data') }
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
  _isTokenExpired (): boolean {
    const tokenData = this._getTokenData()

    return !tokenData || !tokenData.expires_time
    || Date.now() > (Number(tokenData.expires_time) - this.leeway)
  }

  /**
   * Get access token
   */
  signIn (options: SignInOptions): RespP {
    const fetchToken = (authKey, params) => {
      if (this._isTokenExpired() || !this.id) {
        return this._fetchToken(authKey, params)
      }

      return this._getTokenDataP()
    }

    const refreshToken = (token: string) => {
      if (this._isTokenExpired() || !this.id) {
        return this._fetchRefreshToken(this.myAccountId, token)
      }

      return Promise.resolve(this._getTokenData())
    }

    const getTokenDataById = () => {
      if (this._isTokenExpired()) {
        return this._fetchRefreshToken(this.myAccountId, this._getTokenData().refresh_token)
      }

      return Promise.resolve(this._getTokenData())
    }

    if (
      options
      && options.auth_key
      && options.params
      && options.params.client_token
      && options.params.grant_type
    ) {
      return fetchToken(options.auth_key, options.params)
    } else if (options && options.data) {
      this._saveTokenData(options.data)

      return getTokenDataById()
    } else if (options && options.refresh_token) {
      return refreshToken(options.refresh_token)
    } else if (!options && this.id && this._getTokenData()) {
      return getTokenDataById()
    }

    return Promise.reject(new TypeError('Missing required options:  pair `authKey`, `params` or `refresh_token` or missing token data'))
  }

  /**
   * Refresh access token
   * @param {*} id
   */
  refresh (id: string) {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.refresh_token) throw new TypeError('Missing \'refresh_token\' in account data')

      return this._fetchRefreshToken(id, tokenData.refresh_token)
    }
  }

  /**
   * Revoke refresh token
   * @param {*} id
   */
  revoke (id: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.refresh_token) throw new TypeError('Missing \'refresh_token\' in account data')

      return this._fetchRetry(() => this.provider
        .revokeRefreshTokenRequest(id, tokenData.refresh_token))
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then((res) => {
          this._saveTokenData(res)

          return res
        })
    }
  }

  /**
   * Link client's accounts
   * @param {*} authKey
   * @param {*} params
   */
  link (authKey: string, params: {} = {}): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!authKey) throw new TypeError(`Incorrect parameters 'authKey': ${authKey}`)
      if (!params) throw new TypeError(`Incorrect parameters 'params': ${params}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider
        .linkRequest(authKey, params, tokenData.access_token))
        .then(this._checkStatus)
        .then(this._parseJSON)
    }
  }

  /**
   * Get linked accounts
   * @param {*} id
   */
  auth (id: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider.authRequest(id, tokenData.access_token))
        .then(this._checkStatus)
        .then(this._parseJSON)
    }
  }

  /**
   * Delete account link
   * @param {*} id
   * @param {*} authKey
   */
  unlink (id: string, authKey: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider
        .unlinkRequest(id, authKey, tokenData.access_token))
        .then(this._checkStatus)
        .then(this._parseJSON)
    }
  }

  /**
   * Get account info
   * @param {*} id
   */
  get (id: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider
        .accountRequest(id, tokenData.access_token))
        .then(this._checkStatus)
        .then(this._parseJSON)
    }
  }

  /**
   * Remove account
   */
  remove (id: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider
        .removeAccountRequest(id, tokenData.access_token))
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then((res) => {
          this.signOut()

          return res
        })
    }
  }

  /**
   * Check is account enabled
   * @param {*} id
   */
  isEnabled (id: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider.isEnabledRequest(id, tokenData.access_token))
        .then(this._checkStatus)
    }
  }

  /**
   * Enable account
   * @param {*} id
   */
  enable (id: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider.enableRequest(id, tokenData.access_token))
        .then(this._checkStatus)
    }
  }

  /**
   * Disable account
   * @param {*} id
   */
  disable (id: string): CallableP<RespP> {
    return () => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data')

      return this._fetchRetry(() => this.provider.disableRequest(id, tokenData.access_token))
        .then(this._checkStatus)
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
    const tokenData = this._getTokenData()

    if (data && data.access_token) {
      tokenData.access_token = data.access_token
    }
    if (data && data.refresh_token) {
      tokenData.refresh_token = data.refresh_token
    }
    if (data && data.expires_in) {
      tokenData.expires_in = data.expires_in
      tokenData.expires_time = Date.now() + ((Number(data.expires_in) || 0) * 1000)
    }

    this.storage.setItem(`account_${this.id || ''}`, JSON.stringify(tokenData))
  }

  /**
   * Fetch access token
   */
  _fetchToken (authKey: string, params: {} = {}): RespP {
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!params) throw new TypeError(`Incorrect parameter 'params': ${params}`)

    const fetchAccount = data => this._fetchRetry(() => this.provider
      .accountRequest(this.myAccountId, data.access_token))
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
  _fetchRefreshToken (id: string, refreshToken: string = ''): RespP {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    // const saveData = (data: TokenData) => {
    //   if (!data.refresh_token) {
    //     const newData: TokenData = Object.create(data)

    //     newData.refresh_token = refreshToken
    //     this._saveTokenData(newData)
    //   } else {
    //     this._saveTokenData(data)
    //   }
    // }

    const fetchAccount = data => this._fetchRetry(() => this.provider
      .accountRequest(this.myAccountId, data.access_token))
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then((res) => {
        this.id = res.id
        // saveData(data)

        saveData(tokenData => this._saveTokenData(tokenData), data)

        return data
      })

    return this._fetchRetry(() => this.provider.refreshAccessTokenRequest(id, refreshToken))
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then((data) => {
        if (!this.id) return fetchAccount(data)

        // saveData(data)
        saveData(tokenData => this._saveTokenData(tokenData), data)

        return data
      })
  }

  /**
   * Fetch with retry logic
   * @param {*} requestFn
   */
  _fetchRetry (requestFn: () => Request): Promise<Response> {
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
                wrappedFetch(--n) // eslint-disable-line no-param-reassign
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
      if (!response) return reject(new TypeError(`Missing 'response': ${response}`))

      if (response.status && response.status >= 200 && response.status < 300) {
        return resolve(response)
      }

      const error = new Error(response.statusText)

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
