import { Dependency } from '.'
import { Constructor, PropertyName, Value } from '../types'

export interface Register<T> {
  name: PropertyName
  identifierConstructor?: Constructor<T>
  cache?: Value<T>
  dependencies?: Dependency<any>[]
}