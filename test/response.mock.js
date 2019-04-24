/** @flow */
import type { TRefreshReponse, TRevokeResponse, TokenData, ProfileData } from '../src/account.js.flow'

export const audience = 'hello.world'

export const account_label = 'account_label'

export const tokenData: TokenData = {
  access_token: '12345',
  refresh_token: '54321',
  expires_time: 0,
}

export const refreshResponse: TRefreshReponse = {
  access_token: '34567',
  expires_in: 86400,
  token_type: 'Bearer',
}

export const revokeResponse: TRevokeResponse = {
  refresh_token: '67890',
}; // eslint-disable-line semi

export const accountResponse: ProfileData = {
  id: account_label,
}
