/** @flow */
import type { TRefreshReponse, TRevokeResponse } from '../src/account.js.flow'

export const signInId = 'me.hello.world'

export const label = 'me'

export const audience = 'hello.world'

export const refreshResponse: TRefreshReponse = {
  access_token: '34567',
  expires_in: 86400,
  token_type: 'Bearer',
}

export const revokeResponse: TRevokeResponse = {
  refresh_token: '67890',
}

export const accountResponse = {
  id: 'me.hello.world',
}
