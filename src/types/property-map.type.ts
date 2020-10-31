import { Identifier } from '.'
import { Property } from '@/interfaces'

export type PropertyMap<T = any> = Map<Identifier<T>, Property<T>>