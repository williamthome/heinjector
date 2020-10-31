import heinjector from '..'
import { getArgumentNames } from '@/helpers/constructor.helper'
import { makeRegisterOptions } from '@/helpers/register.helper'
import { InjectOptions } from '@/interfaces'
import { Constructor } from '@/types'

export const Inject = <P = any> (options?: InjectOptions<P>) => {
  return <T extends Constructor<P>> (
    constructor: T,
    _propertyKey: string | symbol,
    parameterIndex: number
  ): void => {
    const propertyName = getArgumentNames<P>(constructor)[parameterIndex]

    const { identifier, isArray } = makeRegisterOptions<P>(propertyName, options)

    heinjector.register({
      identifier,
      isArray,
      name: propertyName,
      dependencies: [{
        identifierName: constructor.name,
        propertyName
      }]
    })
  }
}