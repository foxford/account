import tap from 'tap'

import { isExpired, getExpiresTime, validResponse, parsedResponse, parse } from '../../src/utils/index'

global.self = global
// bind global to self for the fetch polyfill
require('whatwg-fetch') // eslint-disable-line node/no-unpublished-require

tap.test('`isExpired` utility', (t) => {
  const now = Date.now()

  tap.same(isExpired(null, now), true)
  tap.same(isExpired(0, now), true)
  tap.same(isExpired({ expires_time: 0 }, now), true)
  tap.same(isExpired({ expires_time: '1000.1' }, now), true)
  tap.same(isExpired({ expires_time: now + 2000 }, now), true)
  tap.same(isExpired({ expires_time: now + 3000 }, now), false)
  tap.same(isExpired({ expires_time: now + 5000 }, now), false)

  t.end()
})

tap.test('`getExpiresTime` utility', (t) => {
  const now = 1552990279393

  tap.throws(() => { getExpiresTime() }, { message: '`expires_in` is absent' })
  tap.throws(() => { getExpiresTime('') }, { message: '`now` is absent' })
  tap.throws(() => { getExpiresTime('', 'test') }, { message: '`now` is absent' })
  tap.throws(() => { getExpiresTime('', now) }, { message: 'Wrong `expires_in` value' })
  tap.throws(() => { getExpiresTime('test', now) }, { message: 'Wrong `expires_in` value' })
  tap.throws(() => { getExpiresTime('-1', now) }, { message: 'Wrong `expires_in` value' })
  tap.throws(() => { getExpiresTime('0', now) }, { message: 'Wrong `expires_in` value' })

  tap.same(getExpiresTime(300, now), 1552990579393)

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
  }, { message: 'Could not parse' })

  tap.throws(() => {
    parse(() => 123)
  }, { message: 'Could not parse' })

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
