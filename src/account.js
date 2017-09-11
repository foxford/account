const MAX_AJAX_RETRY = 3
const AJAX_RETRY_DELAY = 1000
const EXPIRES_LEEWAY = 1000
const MY_ACCOUNT_ID = 'me'

class Account {
  static get version () {
    return __VERSION__
  }

  constructor (config) {
    this.provider = config.provider
    this.retries = config.retries || MAX_AJAX_RETRY
    this.retryDelay = config.retryDelay || AJAX_RETRY_DELAY
    this.expiresLeeway = config.expiresLeeway || EXPIRES_LEEWAY
    this.myAccountId = config.myAccountId || MY_ACCOUNT_ID

    this.id = null
  }

  /**
   * Get token data
   */
  _getTokenData () {
    return JSON.parse(window.localStorage.getItem(`account_${this.id}`)) || null
  }

  /**
   * Check token expire
   */
  _isTokenExpired () {
    return !this._getTokenData() || !this._getTokenData().expires_time ||
    Date.now() > (Number(this._getTokenData().expires_time) - this.expiresLeeway)
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
    const refreshTokenById = (id) => {
      this.id = id
      if (this._isTokenExpired()) {
        return this._fetchRefreshToken(this.myAccountId, this._getTokenData().refresh_token)
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

    if (
      options &&
      options.auth_key &&
      options.params &&
      options.params.client_token &&
      options.params.grant_type
    ) {
      return fetchToken(options.auth_key, options.params)
    } else if (options && options.id) {
      return refreshTokenById(options.id)
    } else if (options && options.refresh_token) {
      return refreshToken(options.refresh_token)
    } else {
      return Promise.reject(new TypeError('`options` has incorrect parameters'))
    }
  }

  /**
   * Refresh access token
   * @param {*} id 
   */
  refresh (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().refresh_token) return Promise.reject(new TypeError('cannot find `refresh_token` in localStorage'))

      return this._fetchRefreshToken(id, this._getTokenData().refresh_token)
    }
  }

  /**
   * Revoke refresh token
   * @param {*} id 
   */
  revoke (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().refresh_token) return Promise.reject(new TypeError('cannot find `refresh_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.revokeRefreshTokenRequest(id, this._getTokenData().refresh_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => {
          this._saveTokenData(data)
          return Promise.resolve(data)
        })
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Link client's accounts
   * @param {*} authKey 
   * @param {*} params
   */
  link (authKey, params) {
    return data => {
      if (!authKey || !params) return Promise.reject(new TypeError('incorrect parameters `authKey` or `params`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.linkRequest(authKey, params, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => Promise.resolve(data))
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Get linked accounts
   * @param {*} id 
   */
  auth (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.authRequest(id, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => Promise.resolve(data))
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Delete account link
   * @param {*} id 
   * @param {*} authKey 
   */
  unlink (id, authKey) {
    return data => {
      if (!id || !authKey) return Promise.reject(new TypeError('incorrect parameter `id` or `authKey`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.unlinkRequest(id, authKey, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => Promise.resolve(data))
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Get account info
   * @param {*} id 
   */
  get (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.accountRequest(id, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => Promise.resolve(data))
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Remove account
   */
  remove (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.removeAccountRequest(id, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(data => {
          this.signOut()
          return Promise.resolve(data)
        })
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Check is account enabled
   * @param {*} id 
   */
  isEnabled (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.isEnabledRequest(id, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(Promise.resolve())
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Enable account
   * @param {*} id 
   */
  enable (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.enableRequest(id, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(Promise.resolve())
        .catch(err => Promise.reject(err))
    }
  }

  /**
   * Disable account
   * @param {*} id
   */
  disable (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      if (!this._getTokenData() && !this._getTokenData().access_token) return Promise.reject(new TypeError('cannot find `access_token` in localStorage'))

      return this._fetchRetry(
        () => this.provider.disableRequest(id, this._getTokenData().access_token)
      )
        .then(this._checkStatus)
        .then(Promise.resolve())
        .catch(err => Promise.reject(err))
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
      return Promise.reject(new ReferenceError('Cannot find `this.id`'))
    }
  }

  /**
   * Save token data
   * @param {*} data 
   */
  _saveTokenData (data) {
    if (!this.id) throw new TypeError('cannot find `id` in object')

    const savedTokenData = this._getTokenData() || {}
    const tokenData = {}

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

    window.localStorage.setItem(`account_${this.id}`, JSON.stringify({ ...savedTokenData, ...tokenData }))
  }

  /**
   * Fetch access token
   */
  _fetchToken (authKey, params) {
    if (!authKey || !params) return Promise.reject(new TypeError('incorrect parameter `authKey` or `params`'))

    const fetchAccount = (data) => {
      return this._fetchRetry(
        () => this.provider.accountRequest(this.myAccountId, data.access_token)
      )
        .then(this._checkStatus)
        .then(this._parseJSON)
        .then(res => {
          this.id = res.id
          this._saveTokenData(data)
          return Promise.resolve(data)
        })
        .catch(err => Promise.reject(err))
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
          return Promise.resolve(data)
        }
      })
      .catch(err => Promise.reject(err))
  }

  /**
   * Fetch refresh token
   */
  _fetchRefreshToken (id, refreshToken) {
    if (!id || !refreshToken) return Promise.reject(new TypeError('incorrect parameter `id` or `refreshToken`'))

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
          return Promise.resolve(data)
        })
        .catch(err => Promise.reject(err))
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
          return Promise.resolve(data)
        }
      })
      .catch(err => Promise.reject(err))
  }

  /**
   * Fetch with retry logic
   * @param {*} requestFn
   */
  _fetchRetry (requestFn) {
    if (!requestFn) throw new TypeError('`requestFn` not found')

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
    if (!response) throw new TypeError('`response` not found')

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
    if (!response) throw new TypeError('`response` not found')

    return response.json()
  }
}

export default Account
