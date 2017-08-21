export function parseJSON (response) {
  return response.json()
}

export function checkStatus (response) {
  if (response.status && response.status >= 200 && response.status < 300) {
    return response
  } else {
    const error = new Error(response.statusText)

    error.response = response
    throw error
  }
}

export function fetchRetry (request, retries, retryDelay) {
  return new Promise((resolve, reject) => {
    const wrappedFetch = (n) => {
      fetch(request)
        .then((response) => {
          resolve(response)
        })
        .catch((error) => {
          if (n > 1) {
            setTimeout(() => {
              wrappedFetch(--n)
            }, retryDelay)
          } else {
            reject(error)
          }
        })
    }
    wrappedFetch(retries)
  })
}
