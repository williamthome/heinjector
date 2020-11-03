import { isProxy } from './proxy.helper'
import { Constructor, Identifier } from '../types'

export const identifierToString = (identifier: Identifier<any>): string => {
  switch (typeof identifier) {
    case 'string':
      return identifier
    case 'symbol':
      return identifier.toString()
    default:
      return identifier.name
  }
}

export const identifierAsMapKey = <T> (identifier: Identifier<T>): Identifier<T> =>
  isProxy(identifier)
    ? (identifier as Constructor<T>).prototype.constructor
    : identifier