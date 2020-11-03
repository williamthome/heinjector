import { Constructor } from '../types'

export const getArgumentNames = <T> (constructor: Constructor<T>): string[] => {
  const RegExInsideParentheses = /[(][^)]*[)]/
  const RegExParenthesesAndSpaces = /[()\s]/g
  const regExValue = RegExInsideParentheses.exec(constructor.toString())
  if (!regExValue) return []
  else return regExValue[0].replace(RegExParenthesesAndSpaces, '').split(',').map(str => str.trim())
}