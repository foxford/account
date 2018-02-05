/* eslint promise/no-callback-in-promise: 0 */
import assert from 'assert'
import pino from 'pino'

import { Account } from '../src/account'
import { IdP } from '../src/idp'
import { nvrnt } from '../src/utils/invariant'
import { isEnv } from '../src/utils/index'

import storage from './mocks/storage-mock'

const isError = (error, msg = null) => assert.ok(error instanceof Error, msg)

const isErrorSays = (error, errorShouldBe) => {
  isError(error)
  assert.equal(error.message, errorShouldBe)
}

const logger = pino()

const debug = nvrnt('account:test:unit', isEnv(process.env.NODE_ENV))

describe('Account unit', () => {
  describe('_getTokenData', () => {
    let account

    before(() => {
      debug('Create account instance')
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
      }, storage())
    })

    it('Fetched data with no ID', (done) => {
      Promise.resolve()
        .then(() => account._getTokenData())
        .then((res) => {
          assert.deepEqual(res, {})

          return done()
        })
        .catch((error) => {
          debug(error)
          done()
        })
    })

    it('Fetched data with ID but empty', (done) => {
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: 'account_id_value',
      }, storage())

      Promise.resolve()
        .then(() => account._getTokenData())
        .then((res) => {
          assert.deepEqual(res, {})

          return done()
        })
        .catch((error) => {
          isError(error)
          done()
        })
    })

    it('Fetched data with ID but not JSON', (done) => {
      const store = storage()

      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: 'me',
      }, store)

      store.setItem('account_me', { a: 123 })

      Promise.resolve()
        .then(() => account._getTokenData())
        .catch((error) => {
          isError(error)
          done()
        })
    })

    it('Fetched data with ID', (done) => {
      const store = storage()

      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: 'me',
      }, store)

      store.setItem('account_me', JSON.stringify({ data: 123 }))

      Promise.resolve()
        .then(() => account._getTokenData())
        .then(({ data }) => {
          assert.ok(data === 123)

          return done()
        })
        .catch(error => logger.error(error))
    })

    after(() => {
      account = null
      debug('Cleanup account')
    })
  })

  describe('_getTokenDataP', () => {
    let account

    before(() => {
      debug('Create account instance')
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
      }, storage())
    })

    it('Fetched data with no ID', (done) => {
      account._getTokenDataP()
        .then((res) => {
          assert.deepEqual(res, {})

          return done()
        })
        .catch((error) => {
          isError(error, 'Fails as expected')
          done()
        })
    })

    it('Fetched data with ID but empty', (done) => {
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: 'me',
      }, storage())

      account._getTokenDataP()
        .then((res) => {
          assert.deepEqual(res, {})

          return done()
        })
        .catch((error) => {
          isError(error)
          done()
        })
    })

    it('Fetched data with ID but not JSON', (done) => {
      const store = storage()

      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: 'me',
      }, store)

      store.setItem('account_me', { a: 123 })

      account._getTokenDataP()
        .catch((error) => {
          isError(error)
          done()
        })
    })

    it('Fetched data with ID', (done) => {
      const store = storage()

      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
        id: 'me',
      }, store)

      store.setItem('account_me', JSON.stringify({ data: 123 }))

      account._getTokenDataP()
        .then(({ data }) => {
          assert.ok(data === 123)

          return done()
        })
        .catch(error => logger.error(error))
    })

    after(() => {
      account = null
      debug('Cleanup account')
    })
  })

  describe('_parseJSON', () => {
    let account

    before(() => {
      debug('Create account instance')
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
      }, storage())
    })

    it('Fails as expected on empty response', (done) => {
      Promise.resolve()
        .then(() => account._parseJSON())
        .catch((error) => {
          debug(error)
          isError(error)
          done()
        })
    })

    it('Got some string', (done) => {
      const responseText = 'ok'

      Promise.resolve()
        .then(() => account._parseJSON(responseText))
        .catch((error) => {
          debug(error)
          isErrorSays(error, 'Response is not a JSON')
          done()
        })
    })

    it('Got response but invalid JSON', (done) => {
      const responseText = 'ok'

      Promise.resolve()
        .then(() => account._parseJSON(new Response(responseText)))
        .catch((error) => {
          debug(error)
          isError(error)
          done()
        })
    })

    it('Got JSON', (done) => {
      const responseText = JSON.stringify({ text: 'some text' })

      Promise.resolve()
        .then(() => account._parseJSON(new Response(responseText)))
        .then((response) => {
          assert.equal(response.text, 'some text')

          return done()
        })
        .catch(error => logger.error(error))
    })

    after(() => {
      account = null
      debug('Cleanup account')
    })
  })

  describe('_checkStatus', () => {
    let account

    before(() => {
      debug('Create account instance')
      account = new Account({
        provider: new IdP({ endpoint: 'https://mock-host' }),
      }, storage())
    })

    it('Fails as expected on empty response', (done) => {
      Promise.resolve()
        .then(() => account._checkStatus())
        .catch((error) => {
          debug(error)
          isError(error)
          done()
        })
    })

    it('Got valid but wrong response (300)', (done) => {
      const response = new Response()

      response.status = 300

      Promise.resolve()
        .then(() => account._checkStatus(response))
        .catch((error) => {
          debug(error)
          isErrorSays(error, 'OK')
          done()
        })
    })

    it('Got valid but wrong response (300) with original data', (done) => {
      const response = new Response('text')

      response.status = 300

      Promise.resolve()
        .then(() => account._checkStatus(response))
        .catch((error) => {
          debug(error)
          isErrorSays(error, 'OK')
          assert.deepEqual(error.response, response)
          done()
        })
    })

    it('Got valid response', (done) => {
      const response = new Response()

      Promise.resolve()
        .then(() => account._checkStatus(response))
        .then((res) => {
          assert.equal(res.statusText, 'OK')
          assert.equal(res.status, 200)

          return done()
        })
        .catch(error => logger.error(error))
    })

    after(() => {
      account = null
      debug('Cleanup account')
    })
  })
})
