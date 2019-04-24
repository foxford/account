/** @flow */
import type { TokenData } from '../account.js.flow'

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
export const isExpired = (data: TokenData, now: number, leeway: number = 3e3): boolean => {
  if (!now || isNaN(now)) throw new TypeError('`now` is absent')

  const _isExpired = x => !x
    || !x.expires_time
    || now > (Number(x.expires_time) - leeway)

  return _isExpired(data)
}

export const getExpiresTime = (expires_in: number, expires_time: number): number => {
  if (typeof expires_in === 'undefined' || isNaN(expires_in)) throw new TypeError('`expires_in` is absent')
  if (typeof expires_time === 'undefined' || isNaN(expires_time)) throw new TypeError('`expires_time` is absent')

  if (expires_in < 0) throw new TypeError('Wrong `expires_in` value')

  return expires_time + expires_in * 1e3
}

export const validResponse = (response: Response): Response => {
  if (response.status && response.status >= 200 && response.status < 300) {
    return response
  }

  throw new Error(response.statusText || `Invalid request. Status: ${response.status}`)
}

export const parsedResponse = (response: Response): Promise<Object> => {
  if (!response) throw new TypeError('`response` is absent')

  try {
    return response.json()
  } catch (error) {
    throw new Error('Response is not a JSON')
  }
}

export const parse = (fn: Function | string): Promise<*> => {
  const it = typeof fn === 'function' ? fn() : fn
  if (typeof it !== 'string') throw new TypeError('Could not parse')

  return new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(it))
    } catch (error) {
      reject(error)
    }
  })
}
