/** @flow */
import type { TokenData } from '../account.js.flow'

type Callback<T> = (a: T) => mixed

export const saveData = (cb: Callback<TokenData>, data: TokenData, token: string = '') => cb(!data.refresh_token
  ? Object.assign({}, data, { refresh_token: token })
  : data)

export const isEnv = (env: string, key: string = 'production'): boolean => env === key
