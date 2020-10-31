import { Identifier, RegisterOptions } from '.'

export type RegisterMap<T = any> = Map<Identifier<T>, RegisterOptions<T>>