import debug from 'debug'

export const Debug = (ns, invariant = false) => {
  if (invariant) return () => undefined
  if (typeof ns !== 'string') throw new TypeError('Namespace should be a string')

  return debug(ns)
}
