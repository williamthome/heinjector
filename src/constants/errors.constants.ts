import { identifierToString } from '@/helpers/identifier.helper'
import { Dependency } from '@/interfaces'
import { Identifier, PropertyName } from '@/types'

export const ERROR_MESSAGES = {
  UNKNOWN_IDENTIFIER: <T> (
    identifier: Identifier<T>
  ): string => `Unknown identifier ${identifierToString(identifier)}`,

  UNKNOWN_IDENTIFIER_NAME: (
    name: PropertyName
  ): string => `Unknown name ${name.toString()} for identifier`,

  UNKNOWN_PROPERTY: (
    property: PropertyName
  ): string => `Unknown property ${property.toString()} for object`,

  CACHE_IS_FALSY: <T> (
    identifier: Identifier<T>
  ): string => `Cache is null or undefined for identifier ${identifierToString(identifier)}`,

  NO_DEPENDENCY_IDENTIFIER: <T> (
    identifier: Identifier<T>,
    dependency: Dependency<any>
  ): string => `No dependency identifier in property ${dependency.propertyName.toString()} for identifier ${identifierToString(identifier)}`
}