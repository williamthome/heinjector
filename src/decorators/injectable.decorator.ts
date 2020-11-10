import heinjector from '..'
import { symbols } from '../helpers/proxy.helper'
import { makeInjectableOptions } from '../helpers/register.helper'
import { InjectableOptions } from '../interfaces'
import { Constructor } from '../types'

export const Injectable = <P = any> (options?: InjectableOptions<P>) => {
  return <T extends Constructor<P>> (
    constructor: T
  ): T => {
    const { identifier, isArray } = makeInjectableOptions<P>(constructor, options)

    heinjector.register({
      identifier,
      isArray,
      name: constructor.name,
      identifierConstructor: constructor,
    })

    return new Proxy(constructor, {
      construct (target, args, newTarget) {
        const instance = Reflect.construct(target, args, newTarget)

        heinjector.define({
          identifier: Array.isArray(identifier) ? identifier[0] : identifier,
          value: instance
        })

        return instance
      },

      has (target, key) {
        return (symbols.isProxy === key) || (key in target)
      }
    })
  }
}