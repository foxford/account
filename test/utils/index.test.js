import assert from 'assert'

import { saveData } from '../../src/utils'

const ACC_TOKEN = 'access_token'
const REF_TOKEN = 'refresh_token'

describe('Utilities', () => {
  describe('saveData', () => {
    it('enhance data with token', (done) => {
      const untokenedData = {
        [ACC_TOKEN]: 'token',
      }

      saveData((data) => {
        const expectData = { [ACC_TOKEN]: 'token', [REF_TOKEN]: 'newtoken' }

        assert.equal(data === expectData, false)
        assert.deepEqual(data, expectData)
      }, untokenedData, 'newtoken')

      saveData((data) => {
        const expectData = { [ACC_TOKEN]: 'token', [REF_TOKEN]: '' }

        assert.equal(data === expectData, false)
        assert.deepEqual(data, expectData)
      }, untokenedData)

      saveData((data) => {
        const expectData = { [ACC_TOKEN]: 'token', [REF_TOKEN]: 'token' }

        assert.equal(data === expectData, false)
        assert.deepEqual(data, expectData)
      }, {
        [ACC_TOKEN]: 'token',
        [REF_TOKEN]: 'token',
      })

      done()
    })
  })
})
