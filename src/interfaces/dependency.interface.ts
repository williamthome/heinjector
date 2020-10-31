import { Identifier, PropertyName } from '@/types'

export interface Dependency<T> {
  identifierName: PropertyName
  identifier?: Identifier<T>
  propertyName: PropertyName
}