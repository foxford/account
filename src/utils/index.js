/** @flow */
import type { TokenData } from '../account.js.flow'

type Callback<T> = (a: T) => mixed

export const saveData = (cb: Callback<TokenData>, data: TokenData, token: string = '') => cb(!data.refresh_token
  ? Object.assign({}, data, { refresh_token: token })
  : data)

export const isEnv = (env: string, key: string = 'production'): boolean => env === key

export const fetchRetry = (requestFn: Function, opts: Object): Promise<Response> => {
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
              wrappedFetch(n - 1)
            }, opts.delay || 1e3)
          })
      }
    }

    wrappedFetch(opts.retries || 3)
  })
}
