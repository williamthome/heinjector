import { InjectableOptions, InjectOptions, Register } from '../interfaces'

export type RegisterOptions<T> = Register<T> & Required<InjectOptions<T> | InjectableOptions<T>>