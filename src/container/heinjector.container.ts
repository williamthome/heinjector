import { ERROR_MESSAGES } from '@/constants'
import { identifierAsMapKey, identifierToString } from '@/helpers/identifier.helper'
import { setOrPush, toArray } from '@/helpers/value.helper'
import { defineObjectProperty } from '@/helpers/object.helper'
import { DefineOptions, Identifier, PropertyMap, PropertyName, Registered, RegisterMap, RegisterOptions, Value } from '@/types'
import { Dependency, Property, ResolveOptions } from '@/interfaces'

export class HeinJector {
  private _registers: RegisterMap

  constructor () {
    this._registers = new Map()
  }

  private set = <T> (options: Registered<T>): void => {
    const { identifier } = options

    this._registers.set(
      identifierAsMapKey(identifier),
      options
    )
  }

  public register = <T> (options: RegisterOptions<T>): void => {
    const { identifierConstructor, identifier, cache, isArray, dependencies } = options

    if (!identifierConstructor && dependencies && dependencies.length > 0 && this.has(identifier))
      this.pushDependency(identifier, ...dependencies)
    else
      this.set({
        ...options,
        cache: cache || isArray ? [] : undefined,
        dependencies: dependencies || []
      })
  }

  private has = <T> (identifier: Identifier<T>): boolean =>
    this._registers.has(identifierAsMapKey(identifier))

  private get = <T> (identifier: Identifier<T>): Registered<T> | undefined =>
    this._registers.get(identifierAsMapKey(identifier))

  private getOrThrow = <T> (identifier: Identifier<T>): Registered<T> => {
    const registered = this.get<T>(identifier)
    if (!registered)
      throw new Error(ERROR_MESSAGES.UNKNOWN_IDENTIFIER(identifier))

    return registered
  }

  private getByName = <T> (name: PropertyName): Registered<T> | undefined => {
    for (const [, registered] of this._registers) {
      if (registered.name === name) {
        return registered
      }
    }
    return undefined
  }

  private getByNameOrThrow = <T> (name: PropertyName): Registered<T> => {
    const registered = this.getByName<T>(name)
    if (!registered)
      throw new Error(ERROR_MESSAGES.UNKNOWN_IDENTIFIER_NAME(name))

    return registered
  }

  private pushDependency = <T> (identifier: Identifier<T>, ...dependency: Dependency[]): void => {
    const registered = this.getOrThrow<T>(identifier)
    registered.dependencies.push(...dependency)

    this.set(registered)
  }

  private updateProperty = <T> (registered: RegisterOptions<T>, { name, value }: Property<T>): void => {
    const { identifier, cache } = registered

    if (!cache) return

    const cacheAsArray = toArray<T>(cache)

    for (const index in cacheAsArray) {
      const toUpdate = cacheAsArray[index]
      const updated = defineObjectProperty(toUpdate, name, value)
      cacheAsArray[index] = updated
    }

    this.define({
      identifier,
      value: cacheAsArray,
      overrideIfArray: true
    })
  }

  private updateDependencyProperty = <T> (identifierName: PropertyName, { name, value }: Property<T>): void => {
    const registered = this.getByNameOrThrow<T>(identifierName)

    this.updateProperty<T>(
      registered,
      {
        name,
        value
      }
    )
  }

  private updateDependencies = <T> (identifier: Identifier<T>): void => {
    const { dependencies, cache } = this.getOrThrow<T>(identifier)

    for (const { identifierName, propertyName } of dependencies) {
      this.updateDependencyProperty(
        identifierName,
        {
          name: propertyName,
          value: cache
        }
      )
    }
  }

  public define = <T> ({
    identifier,
    value,
    overrideIfArray,
    updateDependencies: updateCacheDependencies
  }: DefineOptions<T>): void => {
    const registered = this.getOrThrow<T>(identifier)

    if (registered.isArray && overrideIfArray)
      registered.cache = toArray(value)
    else
      registered.cache = setOrPush(
        registered.isArray
          ? toArray<T>(registered.cache)
          : registered.cache,
        value
      )

    this.set(registered)

    if (updateCacheDependencies)
      this.updateDependencies<T>(identifier)
  }

  private getProperties = <T> (identifier: Identifier<T>): PropertyMap<T> => {
    const properties: PropertyMap<T> = new Map()
    const identifierName = identifierToString(identifier)
    for (const [bindableIdentifier, { dependencies, cache: value }] of this._registers) {
      dependencies
        .filter(dependency => dependency.identifierName === identifierName)
        .forEach(dependency =>
          properties.set(
            bindableIdentifier,
            {
              name: dependency.propertyName,
              value
            }
          )
        )
    }
    return properties
  }

  public resolve = <T> (identifier: Identifier<T>, options?: ResolveOptions): T | T[] => {
    const { identifierConstructor, cache, isArray } = this.getOrThrow<T>(identifier)

    const useCache = options ? options.useCache : false

    if (useCache || !identifierConstructor) {
      if (!cache)
        throw new Error(ERROR_MESSAGES.CACHE_IS_FALSY(identifier))

      return cache
    }

    const valuesToResolve = toArray(cache || new identifierConstructor())
    const properties = this.getProperties(identifier)

    for (const index in valuesToResolve) {
      const toResolve = valuesToResolve[index]

      for (const [bindableIdentifier, { name: propertyName, value: propertyValue }] of properties) {
        defineObjectProperty(
          toResolve,
          propertyName,
          propertyValue || this.resolve(bindableIdentifier)
        )
      }

      valuesToResolve[index] = toResolve
    }

    const resolved = isArray ? valuesToResolve : valuesToResolve[0]

    const override = options ? options.override : true

    if (override) {
      this.define({
        identifier,
        value: resolved
      })
    }

    return resolved
  }

  public clear = (): void => {
    this._registers.clear()
  }
}