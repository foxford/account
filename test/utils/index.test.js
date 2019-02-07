import tap from 'tap'

import { isExpired, validResponse, parsedResponse, parse } from '../../src/utils/index'

global.self = global
// bind global to self for the fetch polyfill
require('whatwg-fetch') // eslint-disable-line node/no-unpublished-require

tap.test('`isExpired` utility', (t) => {
  const now = Date.now()

  tap.same(isExpired(null), true)
  tap.same(isExpired(0), true)
  tap.same(isExpired({ expires_time: 0 }), true)
  tap.same(isExpired({ expires_time: '1000.1' }), true)
  tap.same(isExpired({ expires_time: now + 2000 }), true)
  tap.same(isExpired({ expires_time: now + 5000 }), false)

  t.end()
})

tap.test('`validResponse` utility', (t) => {
  const okResponse = new Response()

  okResponse.status = 200

  const redirectResponse = new Response()

  redirectResponse.status = 300

  tap.deepEqual(validResponse(okResponse), okResponse)
  tap.throws(() => {
    validResponse(redirectResponse)
  }, { message: 'OK' })

  t.end()
})

tap.test('`parsedResponse` utility', (t) => {
  tap.throws(() => {
    parsedResponse()
  }, { message: '`response` is absent' })

  parsedResponse(new Response()).catch((error) => {
    tap.same(error.message, 'Unexpected end of JSON input')
  })

  parsedResponse(new Response({ a: 123 })).catch((error) => {
    tap.same(error.message, 'Unexpected token o in JSON at position 1')
  })

  parsedResponse(new Response('{"a":123}'))
    .then((a) => {
      tap.same(a, { a: 123 })

      return a
    })
    .catch(tap.error)

  t.end()
})

tap.test('`parse` utility', (t) => {
  tap.throws(() => {
    parse(() => ({ a: 123 }))
  }, { message: 'Can not parse' })

  tap.throws(() => {
    parse(() => 123)
  }, { message: 'Can not parse' })

  parse(() => 'hello')
    .catch((error) => {
      tap.same(error.message, 'Unexpected token h in JSON at position 0')
    })

  parse(() => '{"a":123}')
    .then((res) => {
      tap.same(res, { a: 123 })

      return res
    })
    .catch(tap.error)

  t.end()
})
