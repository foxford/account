import {
  fetchRetry,
  parseJSON,
  checkStatus
} from './utils'
import {
  MAX_AJAX_RETRY,
  AJAX_RETRY_DELAY,
  EXPIRES_LEEWAY,
  MY_ACCOUNT_ID
} from './constants'

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
    this._refreshToken = null
  }

  /**
   * Get token data
   */
  get _tokenData () {
    return JSON.parse(window.localStorage.getItem(`account_${this.id}`))
  }

  /**
   * Check token expire
   */
  get _isTokenExpired () {
    return !this._tokenData || !this._tokenData.expires_time ||
    Date.now() > (Number(this._tokenData.expires_time) - this.expiresLeeway)
  }

  /**
   * Get access token
   */
  signIn (config) {
    const fetchToken = (authKey, params) => {
      if (this._isTokenExpired) {
        return this._fetchToken(authKey, params)
      } else {
        return getSavedToken()
      }
    }
    const refreshToken = (params) => {
      if (params.id) this.id = params.id
      if (params.refresh_token) this._refreshToken = params.refresh_token

      const refreshToken = params.refresh_token || this._tokenData.refresh_token

      if (this._isTokenExpired) {
        return this._fetchRefreshToken(this.myAccountId, refreshToken)
      } else {
        return getSavedToken()
      }
    }
    const getSavedToken = () => Promise.resolve(this._tokenData)

    if (
      config &&
      config.auth_key &&
      config.params &&
      config.params.client_token &&
      config.params.grant_type
    ) {
      return fetchToken(config.auth_key, config.params)
    } else if (config && config.id) {
      return refreshToken({ id: config.id })
    } else if (config && config.refresh_token) {
      return refreshToken({ refresh_token: config.refresh_token })
    } else {
      return Promise.reject(new TypeError('`config` has incorrect parameters'))
    }
  }

  /**
   * Refresh access token
   * @param {*} id 
   */
  refresh (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      return this._fetchRefreshToken(id, this._tokenData.refresh_token)
    }
  }

  /**
   * Revoke refresh token
   * @param {*} id 
   */
  revoke (id) {
    return data => {
      if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'))
      return fetchRetry(
        this.provider.revokeTokenRequest(id, this._tokenData.refresh_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
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
      return fetchRetry(
        this.provider.linkRequest(authKey, params, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
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
      return fetchRetry(
        this.provider.authRequest(id, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
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
      return fetchRetry(
        this.provider.unlinkRequest(id, authKey, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
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
      return fetchRetry(
        this.provider.accountRequest(id, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
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
      return fetchRetry(
        this.provider.removeAccountRequest(id, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
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
      return fetchRetry(
        this.provider.isEnabledRequest(id, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
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
      return fetchRetry(
        this.provider.enableRequest(id, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
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
      return fetchRetry(
        this.provider.disableRequest(id, this._tokenData.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
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
      this._refreshToken = null
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
    const tokenData = {
      access_token: data.access_token || this._tokenData.access_token,
      refresh_token: data.refresh_token || this._tokenData.refresh_token,
      expires_in: data.expires_in || this._tokenData.expires_in,
      expires_time: (Date.now() + (data.expires_in * 1000)) || this._tokenData.expires_time
    }

    window.localStorage.setItem(`account_${this.id}`, JSON.stringify(tokenData))
  }

  /**
   * Fetch access token
   */
  _fetchToken (authKey, params) {
    const fetchAccount = (data) => {
      return fetchRetry(
        this.provider.accountRequest(this.myAccountId, data.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
        .then(res => {
          this.id = res.id
          this._saveTokenData(data)
          return Promise.resolve(data)
        })
        .catch(err => Promise.reject(err))
    }

    return fetchRetry(
      this.provider.tokenRequest(authKey, params),
      this.retries,
      this.retryDelay
    )
      .then(checkStatus)
      .then(parseJSON)
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
    const saveData = (data) => {
      if (this._refreshToken) {
        const newData = Object.create(data)
        newData.refresh_token = this._refreshToken
        this._saveTokenData(newData)
      } else {
        this._saveTokenData(data)
      }
    }
    const fetchAccount = (data) => {
      return fetchRetry(
        this.provider.accountRequest(this.myAccountId, data.access_token),
        this.retries,
        this.retryDelay
      )
        .then(checkStatus)
        .then(parseJSON)
        .then(res => {
          this.id = res.id
          saveData(data)
          return Promise.resolve(data)
        })
        .catch(err => Promise.reject(err))
    }

    return fetchRetry(
      this.provider.refreshTokenRequest(id, refreshToken),
      this.retries,
      this.retryDelay
    )
      .then(checkStatus)
      .then(parseJSON)
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
}

export default Account
