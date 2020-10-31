import heinjector from '..'
import { symbols } from '@/helpers/proxy.helper'
import { makeRegisterOptions } from '@/helpers/register.helper'
import { InjectOptions } from '@/interfaces'
import { Constructor } from '@/types'

export const Injectable = <P = any> (options?: InjectOptions<P>) => {
  return <T extends Constructor<P>> (
    constructor: T
  ): T => {
    const { identifier, isArray } = makeRegisterOptions<P>(constructor, options)

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
          identifier,
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