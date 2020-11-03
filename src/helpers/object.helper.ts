import { PropertyName } from '@/types'
import { ERROR_MESSAGES } from '@/constants'

export const defineObjectProperty = <T extends Record<string, any>, V> (
  toUpdate: T,
  propertyName: PropertyName,
  value: V
): T => {
  if (!(propertyName in toUpdate))
    throw new Error(ERROR_MESSAGES.UNKNOWN_PROPERTY(propertyName))

  const descriptor = Object.getOwnPropertyDescriptor(toUpdate, propertyName)
  Object.defineProperty(toUpdate, propertyName, {
    ...descriptor,
    value
  })

  return toUpdate
}