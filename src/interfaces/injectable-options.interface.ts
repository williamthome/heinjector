import { Identifier } from '../types'

export interface InjectableOptions<T> {
  identifier?: Identifier<T> | Array<Identifier<T>>
  isArray?: boolean
}