/** @flow */
import Debug from 'debug'

const novariant = (output = false) => (input, ...argv) => output
  && [input, ...argv]

export const nvrnt = (ns: string, _variant: boolean = false, fn: typeof Debug = Debug) => {
  if (typeof fn !== 'function') throw new TypeError('Wrong output fn')

  const notvariant = novariant(_variant)
  const write = fn(ns)

  return (...argv: Array<string | number>) => _variant && write(notvariant(...argv))
}
