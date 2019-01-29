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

/**
 * Check token expire
 */
export const isExpired = (data: TokenData, leeway: number = 3e3): boolean => {
  const _isExpired = x => !x
    || !x.expires_time
    || Date.now() > (Number(x.expires_time) - leeway)

  return _isExpired(data)
}

export const validResponse = (response: Response): Response => {
  if (response.status && response.status >= 200 && response.status < 300) {
    return response
  }

  throw new Error(response.statusText || `Invalid request. Status: ${response.status}`)
}

export const parsedResponse = (response: Response): Promise<Object> => {
  if (!response) throw new TypeError(`Missing 'response': ${response}`)

  try {
    return response.json()
  } catch (error) {
    throw new Error('Response is not a JSON')
  }
}

export const parse = (fn: Function): Promise<*> => {
  const it = typeof fn === 'function' ? fn() : fn
  if (typeof it !== 'string') throw new TypeError('Can not parse')

  return Promise.resolve(JSON.parse(it))
}
