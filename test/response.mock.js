/** @flow */
import type { TRefreshReponse, TRevokeResponse, TokenData } from '../src/account.js.flow'

export const audience = 'hello.world'

export const account_label = 'account_label'

export const tokenData: TokenData = {
  access_token: '12345',
  refresh_token: '54321',
  expires_in: 0,
}

export const refreshResponse: TRefreshReponse = {
  access_token: '34567',
  expires_in: 86400,
  token_type: 'Bearer',
}

export const revokeResponse: TRevokeResponse = {
  refresh_token: '67890',
}

export const accountResponse = {
  access_token: '34567',
  refresh_token: '54321',
  token_type: 'Bearer',
}
