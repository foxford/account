const MAX_AJAX_RETRY = 3
const AJAX_RETRY_DELAY = 1000
const LEEWAY = 3000
const MY_ACCOUNT_ID = 'me'

class Account {
  static get version () {
    return __VERSION__
  }

  constructor (config) {
    if (!config || !config.provider) throw new TypeError('Missing `provider` in config')

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
  _getTokenData () {
    let item
    try {
      item = window.localStorage.getItem(`account_${this.id}`)
    } catch (err) { throw new Error(`Missing account id: ${this.id}`) }
    try {
      return JSON.parse(item)
    } catch (err) { throw new Error('Error occured when parse from account data') }
  }

  /**
   * Check token expire
   */
  _isTokenExpired () {
    const tokenData = this._getTokenData()

    return !tokenData || !tokenData.expires_time ||
    Date.now() > (Number(tokenData.expires_time) - this.leeway)
  }

  /**
   * Get access token
   */
  signIn (options) {
    const fetchToken = (authKey, params) => {
      if (this._isTokenExpired()) {
        return this._fetchToken(authKey, params)
      } else {
        return Promise.resolve(this._getTokenData())
      }
    }
    const refreshToken = (refreshToken) => {
      if (this._isTokenExpired()) {
        return this._fetchRefreshToken(this.myAccountId, refreshToken)
      } else {
        return Promise.resolve(this._getTokenData())
      }
    }
    const getTokenDataById = () => {
      if (this._isTokenExpired()) {
        return this._fetchRefreshToken(this.myAccountId, this._getTokenData().refresh_token)
      } else {
        return Promise.resolve(this._getTokenData())
      }
    }

    if (
      options &&
      options.auth_key &&
      options.params &&
      options.params.client_token &&
      options.params.grant_type
    ) {
      return fetchToken(options.auth_key, options.params)
    } else if (options && options.refresh_token) {
      return refreshToken(options.refresh_token)
    } else if (!options && this.id && this._getTokenData()) {
      return getTokenDataById()
    } else {
      return Promise.reject(new TypeError('Missing required options:  pair `authKey`, `params` or `refresh_token` or missing token data'))
    }
  }

  /**
   * Refresh access token
   * @param {*} id 
   */
  refresh (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.refresh_token) throw new TypeError(`Missing 'refresh_token' in account data`)

      return this._fetchRefreshToken(id, tokenData.refresh_token)
    }
  }

  /**
   * Revoke refresh token
   * @param {*} id 
   */
  revoke (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.refresh_token) throw new TypeError(`Missing 'refresh_token' in account data`)

      return this._fetchRetry(
        () => this.provider.revokeRefreshTokenRequest(id, tokenData.refresh_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => {
          this._saveTokenData(data)
          return data
        })
    }
  }

  /**
   * Link client's accounts
   * @param {*} authKey 
   * @param {*} params
   */
  link (authKey, params) {
    return data => {
      const tokenData = this._getTokenData()

      if (!authKey) throw new TypeError(`Incorrect parameters 'authKey': ${authKey}`)
      if (!params) throw new TypeError(`Incorrect parameters 'params': ${params}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.linkRequest(authKey, params, tokenData.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => data)
    }
  }

  /**
   * Get linked accounts
   * @param {*} id 
   */
  auth (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.authRequest(id, tokenData.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => data)
    }
  }

  /**
   * Delete account link
   * @param {*} id 
   * @param {*} authKey 
   */
  unlink (id, authKey) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.unlinkRequest(id, authKey, tokenData.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => data)
    }
  }

  /**
   * Get account info
   * @param {*} id 
   */
  get (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.accountRequest(id, tokenData.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => data)
    }
  }

  /**
   * Remove account
   */
  remove (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.removeAccountRequest(id, tokenData.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => {
          this.signOut()
          return data
        })
    }
  }

  /**
   * Check is account enabled
   * @param {*} id 
   */
  isEnabled (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.isEnabledRequest(id, tokenData.access_token)
      )
        .then(this._checkStatus)
    }
  }

  /**
   * Enable account
   * @param {*} id 
   */
  enable (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.enableRequest(id, tokenData.access_token)
      )
        .then(this._checkStatus)
    }
  }

  /**
   * Disable account
   * @param {*} id
   */
  disable (id) {
    return data => {
      const tokenData = this._getTokenData()

      if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
      if (!tokenData && !tokenData.access_token) throw new TypeError(`Missing 'access_token' in account data`)

      return this._fetchRetry(
        () => this.provider.disableRequest(id, tokenData.access_token)
      )
        .then(this._checkStatus)
    }
  }

  /**
   * Delete access token
   */
  signOut () {
    if (this.id) {
      window.localStorage.removeItem(`account_${this.id}`)
      this.id = null
      return Promise.resolve()
    } else {
      throw new ReferenceError(`Missing account id: ${this.id}`)
    }
  }

  /**
   * Save token data
   * @param {*} data 
   */
  _saveTokenData (data) {
    if (!this.id) throw new TypeError(`Missing account id: ${this.id}`)

    const tokenData = this._getTokenData() || {}

    if (data && data.access_token) {
      tokenData.access_token = data.access_token
    }
    if (data && data.refresh_token) {
      tokenData.refresh_token = data.refresh_token
    }
    if (data && data.expires_in) {
      tokenData.expires_in = data.expires_in
      tokenData.expires_time = Date.now() + (data.expires_in * 1000)
    }

    window.localStorage.setItem(`account_${this.id}`, JSON.stringify(tokenData))
  }

  /**
   * Fetch access token
   */
  _fetchToken (authKey, params) {
    if (!authKey) throw new TypeError(`Incorrect parameter 'authKey': ${authKey}`)
    if (!params) throw new TypeError(`Incorrect parameter 'params': ${params}`)

    const fetchAccount = (data) => {
      return this._fetchRetry(
        () => this.provider.accountRequest(this.myAccountId, data.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(res => {
          this.id = res.id
          this._saveTokenData(data)
          return data
        })
    }

    return this._fetchRetry(
      () => this.provider.accessTokenRequest(authKey, params)
    )
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then(data => {
        if (!this.id) {
          return fetchAccount(data)
        } else {
          this._saveTokenData(data)
          return data
        }
      })
  }

  /**
   * Fetch refresh token
   */
  _fetchRefreshToken (id, refreshToken) {
    if (!id) throw new TypeError(`Incorrect parameter 'id': ${id}`)
    if (!refreshToken) throw new TypeError(`Incorrect parameter 'refreshToken': ${refreshToken}`)

    const saveData = (data) => {
      if (!data.refresh_token) {
        const newData = Object.create(data)
        newData.refresh_token = refreshToken
        this._saveTokenData(newData)
      } else {
        this._saveTokenData(data)
      }
    }
    const fetchAccount = (data) => {
      return this._fetchRetry(
        () => this.provider.accountRequest(this.myAccountId, data.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(res => {
          this.id = res.id
          saveData(data)
          return data
        })
    }

    return this._fetchRetry(
      () => this.provider.refreshAccessTokenRequest(id, refreshToken)
    )
      .then(this._checkStatus)
      .then(this._parseJSON)
      .then(data => {
        if (!this.id) {
          return fetchAccount(data)
        } else {
          saveData(data)
          return data
        }
      })
  }

  /**
   * Fetch with retry logic
   * @param {*} requestFn
   */
  _fetchRetry (requestFn) {
    if (!requestFn) throw new TypeError(`Missing 'requestFn': ${requestFn}`)

    return new Promise((resolve, reject) => {
      const errors = []
      const wrappedFetch = (n) => {
        if (n < 1) {
          reject(errors)
        } else {
          fetch(requestFn())
            .then(response => resolve(response))
            .catch(error => {
              errors.push(error)
              setTimeout(() => {
                wrappedFetch(--n)
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
  _checkStatus (response) {
    if (!response) throw new TypeError(`Missing 'response': ${response}`)

    if (response.status && response.status >= 200 && response.status < 300) {
      return response
    } else {
      const error = new Error(response.statusText)

      error.response = response
      throw error
    }
  }

  /**
   * Parse response to JSON
   * @param {*} response 
   */
  _parseJSON (response) {
    if (!response) throw new TypeError(`Missing 'response': ${response}`)

    return response.json()
  }
}

export default Account
