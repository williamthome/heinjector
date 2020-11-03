import { Identifier } from '../types'

export interface InjectOptions<T> {
  identifier?: Identifier<T>
  isArray?: boolean
}