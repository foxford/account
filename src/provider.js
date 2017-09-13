class Provider {
  accessTokenRequest () {
    throw new TypeError('Abstract method `accessTokenRequest` is not implemented')
  }

  refreshAccessTokenRequest () {
    throw new TypeError('Abstract method `refreshAccessTokenRequest` is not implemented')
  }

  revokeRefreshTokenRequest () {
    throw new TypeError('Abstract method `revokeRefreshTokenRequest` is not implemented')
  }

  linkRequest () {
    throw new TypeError('Abstract method `linkRequest` is not implemented')
  }

  authRequest () {
    throw new TypeError('Abstract method `authRequest` is not implemented')
  }

  unlinkRequest () {
    throw new TypeError('Abstract method `unlinkRequest` is not implemented')
  }

  accountRequest () {
    throw new TypeError('Abstract method `accountRequest` is not implemented')
  }

  removeAccountRequest () {
    throw new TypeError('Abstract method `removeAccountRequest` is not implemented')
  }

  isEnabledRequest () {
    throw new TypeError('Abstract method `isEnabledRequest` is not implemented')
  }

  enableRequest () {
    throw new TypeError('Abstract method `enableRequest` is not implemented')
  }

  disableRequest () {
    throw new TypeError('Abstract method `disableRequest` is not implemented')
  }
}

export default Provider
