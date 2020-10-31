import { PropertyName, Value } from '@/types'

export interface Property<T> {
  name: PropertyName
  value: Value<T>
}