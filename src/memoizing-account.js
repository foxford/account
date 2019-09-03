import { Account } from './account'

export class MemoizingAccount extends Account {
  constructor (...argv) {
    super(...argv)

    this.pendingRequests = new Map([])
  }

  memoizedPromise (label, fn) {
    const store = this.pendingRequests
    const maybePending = store.get(label)

    let nextPromise

    if (!maybePending) {
      nextPromise = fn()
        .then((data) => {
          store.delete(label)

          return data
        })
        .catch(() => {
          store.delete(label)
        })
      store.set(label, nextPromise)

      return nextPromise
    }

    return maybePending
  }

  account (storageLabel = '') {
    const label = storageLabel || this.id

    return this.memoizedPromise(`account_${label}`, () => super.account(storageLabel))
  }

  tokenData (storageLabel) {
    const label = storageLabel || this.id

    return this.memoizedPromise(`tokendata_${label}`, () => super.tokenData(storageLabel))
  }

  revokeRefreshToken (storageLabel) {
    const label = storageLabel || this.id

    return this.memoizedPromise(`revoketoken_${label}`, () => super.revokeRefreshToken(storageLabel))
  }
}
