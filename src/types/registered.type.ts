import { RegisterOptions } from '.'

export type Registered<T> =
  Omit<RegisterOptions<T>, 'dependencies'> &
  Required<Pick<RegisterOptions<T>, 'dependencies'>>