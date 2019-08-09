/** @flow strict-local */
import { Debug } from './utils/index'

import type { TokenData, Token } from './account.js.flow'

// eslint-disable-next-line no-unused-vars
type Account<Config, Storage> = {
  tokenData(): Promise<TokenData>,
  store(token: TokenData, label?: string): Promise<TokenData>
}

type Account_t = Account<mixed, mixed>

type maybeAccount = Account_t | typeof undefined

const debug = Debug('@netology-group/account/token-provider')

export class TokenProvider {
  __token: TokenData;

  __engine: maybeAccount;

  constructor (token: TokenData, engine?: Account_t) {
    const {
      access_token,
      refresh_token,
      expires_time = 0,
    } = token

    this.__token = {
      access_token,
      refresh_token,
      expires_time,
    }

    engine && this
      .iEngine(engine)
      .initialize()
  }

  iEngine (engine: Account_t) {
    this.__engine = engine

    return this
  }

  initialize () {
    if (!this.__engine) throw new TypeError('`engine` is absent')
    this.__engine.store(this.__token)

    return this
  }

  token (): Promise<Token> {
    const { __engine }: { __engine: maybeAccount } = this
    if (!__engine) throw new TypeError('`engine` is absent')

    return __engine.tokenData().then(_ => _.access_token)
  }

  // use `getToken` method for backward compatibility
  getToken (): Promise<Token> {
    // eslint-disable-next-line no-console
    debug('`getToken` is deprecated. Use `.token()` instead.')

    return this.token()
  }
}
