import debug from 'debug'

export const Debug = (ns, invariant = false) => {
  if (typeof ns !== 'string') throw new TypeError('Namespace should be a string')
  if (invariant) return () => undefined

  return debug(ns)
}
