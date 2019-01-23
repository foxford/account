import tap from 'tap'

import { saveData } from '../../src/utils'

const ACC_TOKEN = 'access_token'
const REF_TOKEN = 'refresh_token'

tap.test('`saveData` utility', (t) => {
  t.test('enhance data with token', (test) => {
    const untokenedData = {
      [ACC_TOKEN]: 'token',
    }

    saveData((data) => {
      const expectData = { [ACC_TOKEN]: 'token', [REF_TOKEN]: 'newtoken' }

      tap.equal(data === expectData, false)
      tap.deepEqual(data, expectData)
    }, untokenedData, 'newtoken')

    saveData((data) => {
      const expectData = { [ACC_TOKEN]: 'token', [REF_TOKEN]: '' }

      tap.equal(data === expectData, false)
      tap.deepEqual(data, expectData)
    }, untokenedData)

    saveData((data) => {
      const expectData = { [ACC_TOKEN]: 'token', [REF_TOKEN]: 'token' }

      tap.equal(data === expectData, false)
      tap.deepEqual(data, expectData)
    }, {
      [ACC_TOKEN]: 'token',
      [REF_TOKEN]: 'token',
    })

    test.end()
  })

  t.end()
})
