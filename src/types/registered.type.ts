import { RegisterOptions } from '.'
import { Identifier } from './identifier.type'

export type Registered<T> =
  Omit<RegisterOptions<T>, 'dependencies' | 'identifier'> &
  Required<Pick<RegisterOptions<T>, 'dependencies'>> &
  { identifier: Array<Identifier<T>> }