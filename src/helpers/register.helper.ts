import { InjectOptions } from '@/interfaces'

type DefaultRegisterOptions<T> =
  Required<Omit<InjectOptions<T>, 'identifier'>> &
  Pick<InjectOptions<T>, 'identifier'>

export const defaultRegisterOptions: DefaultRegisterOptions<any> = {
  identifier: undefined,
  isArray: false
}