import { InjectableOptions, InjectOptions } from '../interfaces'
import { Identifier } from '../types'

type DefaultInjectOptions<T> =
  Required<Omit<InjectOptions<T>, 'identifier'>> &
  Pick<InjectOptions<T>, 'identifier'>

type DefaultInjectableOptions<T> =
  Required<Omit<InjectableOptions<T>, 'identifier'>> &
  Pick<InjectableOptions<T>, 'identifier'>

export const defaultInjectOptions: DefaultInjectOptions<any> = {
  identifier: undefined,
  isArray: false
}

export const defaultInjectableOptions: DefaultInjectableOptions<any> = {
  identifier: [],
  isArray: false
}

export const makeInjectOptions = <T> (
  identifierIfUndefined: Identifier<T>,
  options?: InjectOptions<T>
): Required<InjectOptions<T>> => {
  return {
    ...defaultInjectOptions,
    ...options,
    identifier: options?.identifier || identifierIfUndefined
  }
}

export const makeInjectableOptions = <T> (
  identifierIfUndefined: Identifier<T>,
  options?: InjectableOptions<T>
): Required<InjectableOptions<T>> => {
  return {
    ...defaultInjectOptions,
    ...options,
    identifier: options?.identifier || identifierIfUndefined
  }
}