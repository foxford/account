/** @flow */
import type { IAbstractStorage } from './storage.js.flow'

export default class AbstractStorage implements IAbstractStorage {
  setItem: (key: string, value: string) => void

  getItem: (key: string) => string

  removeItem: (key: string) => void
}

export { AbstractStorage }
