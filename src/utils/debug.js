import debug from 'debug'

export const Debug = (ns) => {
  if (typeof ns !== 'string') throw new TypeError('Namespace should be a string')
  if (process.env.NODE_ENV === 'production') return () => undefined

  return debug(ns)
}
