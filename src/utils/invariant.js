/** @flow */
import Debug from 'debug'

type Falsy = boolean | null
type MaybeFn = Function | boolean

export const nvrnt = (ns: string, _variant?: Falsy = null, fn?: MaybeFn = false) => {
  const provider = (typeof fn === 'function' ? fn : Debug)(ns)
  const isVariantAlready = _variant !== null

  return (__variant: string | number, ...argv?: Array<*>): void => {
    const shouldRun = isVariantAlready ? !_variant : !__variant
    const args = isVariantAlready ? [__variant, ...argv] : argv

    shouldRun && provider(...args)
  }
}
