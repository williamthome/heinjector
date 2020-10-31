import { identifierToString } from '@/helpers/identifier.helper'
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
  OBJECT_IS_FALSY: 'Object is null or undefined'
}