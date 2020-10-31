export const symbols = {
  isProxy: Symbol('isProxy')
}

export const isProxy = <T> (obj: T): boolean =>
  typeof obj === 'function'
    ? symbols.isProxy in obj
    : false