import Account from '../src/account'
import IdP from '../src/idp'
import { signInId } from './mocks/response-mock'

export const account = new Account({
  provider: new IdP({ endpoint: 'https://media-idp-rc.foxford.ru:10001/api/v1' })
})
export const authKey = 'oauth2.foxford'
export const params = {
  client_token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJtZWRpYS1pZHAuZm94Zm9yZC5ydSIsImV4cCI6MzI1MDM2ODAwMDAsImlzcyI6ImZveGZvcmQucnUiLCJyb2xlIjoiYWRtaW4iLCJzdWIiOiJKb2huIn0.aoSEc_W3LQnZvMrM_eGXcqY7O9Pxulk9z6I8sF4lQzvf-_SaE4g4dGbquOjctUULAxBvpljSIso59_7II477JQ',
  grant_type: 'client_credentials'
}
export const accountId = signInId
