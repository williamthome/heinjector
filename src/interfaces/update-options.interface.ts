import { Identifier, Value } from '../types'

export interface UpdateOptions<T> {
  identifier: Identifier<T>
  value: Value<T>,
  overrideIfArray?: boolean
}