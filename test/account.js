import storageMock from './mocks/storage-mock'
import es6Promise from 'es6-promise'
import 'isomorphic-fetch'
import _parseJSON from './methods/_parsejson'
import _checkStatus from './methods/_checkstatus'
import _fetchRetry from './methods/_fetchretry'
import signIn from './methods/sign-in'
import refresh from './methods/refresh'
import revoke from './methods/revoke'
import get from './methods/get'
import remove from './methods/remove'
import auth from './methods/auth'
import link from './methods/link'
import unlink from './methods/unlink'
import isEnabled from './methods/is-enabled'
import enable from './methods/enable'
import disable from './methods/disable'
import signOut from './methods/sign-out'

es6Promise.polyfill()
window.localStorage = storageMock()

describe('Account', () => {
  describe('_checkStatus', () => _checkStatus())

  describe('_parseJSON', () => _parseJSON())

  describe('_fetchRetry', () => _fetchRetry())

  describe('signIn', () => signIn())

  describe('refresh', () => refresh())

  describe('revoke', () => revoke())

  describe('link', () => link())

  describe('auth', () => auth())

  describe('unlink', () => unlink())

  describe('get', () => get())

  describe('remove', () => remove())

  describe('isEnabled', () => isEnabled())

  describe('enable', () => enable())

  describe('disable', () => disable())

  describe('signOut', () => signOut())
})
