import { Value } from '@/types'

export const toArray = <T> (obj: Value<T>): T[] =>
  !obj
    ? []
    : obj instanceof Array
      ? obj
      : [obj]

export const setOrPush = <T> (original: Value<T>, toSetOrPush: Value<T>): Value<T> => {
  if (!original || !toSetOrPush) {
    original = toSetOrPush
  } else if (original instanceof Array) {
    if (toSetOrPush instanceof Array) original.push(...toSetOrPush)
    else original.push(toSetOrPush)
  } else {
    if (toSetOrPush instanceof Array)
      original = toSetOrPush[0]
    else
      original = toSetOrPush
  }
  return original
}