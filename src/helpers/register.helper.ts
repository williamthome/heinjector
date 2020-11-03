import { InjectOptions } from '../interfaces'
import { Identifier } from '../types'

type DefaultRegisterOptions<T> =
  Required<Omit<InjectOptions<T>, 'identifier'>> &
  Pick<InjectOptions<T>, 'identifier'>

export const defaultRegisterOptions: DefaultRegisterOptions<any> = {
  identifier: undefined,
  isArray: false
}

export const makeRegisterOptions = <T> (
  identifierIfUndefined: Identifier<T>,
  options?: InjectOptions<T>
): Required<InjectOptions<T>> => {
  return {
    ...defaultRegisterOptions,
    ...options,
    identifier: options?.identifier || identifierIfUndefined
  }
}