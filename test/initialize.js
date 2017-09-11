import Account from '../src/account'
import IdP from '../src/idp'
import { signInId } from './mocks/response-mock'

export const account = new Account({
  provider: new IdP({ endpoint: 'https://mock-host' })
})
export const authKey = 'oauth2.key'
export const params = {
  client_token: '12345',
  grant_type: 'client_credentials'
}
export const accountId = signInId
