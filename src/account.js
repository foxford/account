/** @flow */
import type { IdP } from './idp'
import type { EndpointConfig } from './identity-provider.js.flow'
import type { IAbstractStorage as AbstractStorage } from './storage.js.flow'
import type { AccountConfig, TokenData, ProfileData, TRefreshReponse, TRevokeResponse } from './account.js.flow'
import { fetchRetry, isExpired, getExpiresTime, validResponse, parsedResponse, parse } from './utils/index'

const MAX_AJAX_RETRY = 3
const AJAX_RETRY_DELAY = 1000
const LEEWAY = 3000

export class Account<Config: AccountConfig, Storage: AbstractStorage> {
  fetchFn: Function;

  fetchOpts: Object;

  id: string;

  label: string;

  leeway: number;

  requestMode: 'label' | 'id';

  provider: IdP<EndpointConfig>;

  retries: number;

  retryDelay: number;

  storage: Storage;

  constructor (config: Config, provider: IdP<EndpointConfig>, storage: Storage) {
    if (!config) throw new TypeError('Missing `config`')
    if (!provider) throw new TypeError('Provider is not defined')
    if (!storage) throw new TypeError('Storage is not defined')

    this.storage = storage
    this.provider = provider
    this.fetchFn = fetchRetry
    this.fetchOpts = {
      delay: config.retryDelay || AJAX_RETRY_DELAY,
      retries: config.retries || MAX_AJAX_RETRY,
    }
    this.leeway = config.leeway || LEEWAY
    this.requestMode = config.requestMode || 'id'

    const { id, label } = this._createId(config.audience, config.label)

    this.label = label
    this.id = id

    if (!this.id) throw new TypeError('Failed to configure account. Id is not present')
  }

  // eslint-disable-next-line max-len
  static fetchLabel (data: TokenData, provider: IdP<EndpointConfig>, label: void | string): Promise<ProfileData> {
    const { refresh_token } = data

    if (!refresh_token) throw new TypeError('`refresh_token` is absent')
    if (!provider) throw new TypeError('Provider is not defined')

    const fetchOpts = {
      delay: AJAX_RETRY_DELAY,
      retries: MAX_AJAX_RETRY,
    }

    return fetchRetry(() => provider.refreshAccessToken(label || 'me', refresh_token), fetchOpts)
      .then(validResponse)
      .then(parsedResponse)
      // eslint-disable-next-line promise/no-nesting
      .then((tokenData: TRefreshReponse) => fetchRetry(() => provider.account(label || 'me', tokenData.access_token), fetchOpts)
        .then(validResponse)
        .then(parsedResponse))
  }

  // eslint-disable-next-line class-methods-use-this
  _createId (audience: string, label: string, separator: string = '.'): { label: string, id: string } {
    if (!audience) throw new TypeError('`audience` is absent')
    if (!label) throw new TypeError('`label` is absent')

    return {
      id: `${label}${separator}${audience}`,
      label,
    }
  }

  _requestLabel (): string {
    return this.requestMode === 'label' ? this.label : this.id
  }

  load (storageLabel: string = ''): Promise<TokenData> {
    const label = storageLabel || this.id
    if (!label) return Promise.reject(new TypeError('`label` is absent'))

    return Promise.resolve(() => this.storage.getItem(label))
      .then((fn) => {
        const value = fn()
        if (!value) throw new TypeError('Could not load data')

        return parse(value)
      })
  }

  remove (storageLabel: string = ''): Promise<TokenData> {
    const label = storageLabel || this.id
    if (!label) return Promise.reject(new TypeError('`label` is absent'))

    return this.load(label)
      .then((tokenData) => {
        this.storage.removeItem(label)

        return tokenData
      })
  }

  store (data: TokenData, storageLabel: string = ''): Promise<TokenData> {
    if (!data) throw new TypeError('`token` is absent')

    const accessExists = Object.prototype.hasOwnProperty.call(data, 'access_token')
    const refreshExists = Object.prototype.hasOwnProperty.call(data, 'refresh_token')

    if (!accessExists) throw new TypeError('`access_token` is absent')

    if (refreshExists && !data.refresh_token) throw new TypeError('`refresh_token` is absent')

    if (!refreshExists && !data.access_token) throw new TypeError('`access_token` is absent')

    return this._store(data, storageLabel)
  }

  _store (data: TokenData, storageLabel: string = ''): Promise<TokenData> {
    const label = storageLabel || this.id
    if (!label) return Promise.reject(new TypeError('`label` is absent'))

    const token = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_time: data.expires_time || 0,
    }

    return Promise.resolve(token)
      .then((tokenData) => {
        this.storage.setItem(label, JSON.stringify(tokenData))

        return tokenData
      })
  }

  account (storageLabel: string = ''): Promise<ProfileData> {
    const label = storageLabel || this.id

    const fn = this.provider.account

    return this.tokenData(label)
      .then((data: TokenData) => {
        const { access_token } = data

        return [this._requestLabel(), access_token]
      })
      .then(req => this.fetchFn(() => fn.call(this.provider, ...req), this.fetchOpts))
      .then(validResponse)
      .then(parsedResponse)
  }

  tokenData (storageLabel: string = ''): Promise<TokenData> {
    const label = storageLabel || this.id

    const fn = this.provider.refreshAccessToken

    return this.load(label)
      .then((maybeValidTokens: TokenData) => {
        const expired = isExpired(maybeValidTokens, Date.now(), this.leeway)

        if (!expired) return maybeValidTokens

        const { refresh_token } = maybeValidTokens

        // eslint-disable-next-line promise/no-nesting
        return Promise.resolve([this._requestLabel(), refresh_token])
          .then(req => this.fetchFn(() => fn.call(this.provider, ...req), this.fetchOpts))
          .then(validResponse)
          .then(parsedResponse)
          // eslint-disable-next-line promise/no-nesting
          .then((_: TRefreshReponse) => this.load(label)
            .then(old => this.store({
              access_token: _.access_token,
              refresh_token: old.refresh_token,
              expires_time: getExpiresTime(_.expires_in, Date.now()),
            })))
      })
  }

  revokeRefreshToken (storageLabel: string = ''): Promise<TokenData> {
    const label = storageLabel || this.id

    const fn = this.provider.revokeRefreshToken

    return this.load(label)
      .then((maybeToken) => {
        const { refresh_token } = maybeToken

        return [this._requestLabel(), refresh_token]
      })
      .then(req => this.fetchFn(() => fn.call(this.provider, ...req), this.fetchOpts))
      .then(validResponse)
      .then(parsedResponse)
      // eslint-disable-next-line promise/no-nesting
      .then((_: TRevokeResponse) => this.load(label)
        .then(old => this.store({
          access_token: old.access_token,
          refresh_token: _.refresh_token,
          expires_time: old.expires_time,
        })))
  }
}
