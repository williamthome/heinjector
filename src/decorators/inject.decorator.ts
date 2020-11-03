import heinjector from '..'
import { getArgumentNames } from '../helpers/constructor.helper'
import { makeRegisterOptions } from '../helpers/register.helper'
import { InjectOptions } from '../interfaces'
import { Constructor } from '../types'

export const Inject = <TConstructor = any, TIdentifier = any> (options?: InjectOptions<TIdentifier>) => {
  return <T extends Constructor<TConstructor>> (
    constructor: T,
    _propertyKey: string | symbol,
    parameterIndex: number
  ): void => {
    const propertyName = getArgumentNames<TConstructor>(constructor)[parameterIndex]

    const { identifier, isArray } = makeRegisterOptions<TIdentifier>(propertyName, options)

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