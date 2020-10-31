import { Identifier, Registered } from '.'

export type RegisterMap<T = any> = Map<Identifier<T>, Registered<T>>