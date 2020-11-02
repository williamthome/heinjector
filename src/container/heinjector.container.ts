import { ERROR_MESSAGES } from '@/constants'
import { identifierAsMapKey, identifierToString } from '@/helpers/identifier.helper'
import { setOrPush, toArray } from '@/helpers/value.helper'
import { defineObjectProperty } from '@/helpers/object.helper'
import { DefineOptions, Identifier, PropertyMap, PropertyName, Registered, RegisterMap, RegisterOptions, Value } from '@/types'
import { Dependency, Property, ResolveOptions } from '@/interfaces'

export class HeinJector {
  private _registers: RegisterMap
  private _waitingForIdentifier: Map<PropertyName, Identifier<any>[]>

  constructor () {
    this._registers = new Map()
    this._waitingForIdentifier = new Map()
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

    // If don't have constructor it's a parameter
    if (!identifierConstructor && dependencies && dependencies.length > 0) {
      // Property dependencies unknown their identifier
      // because properties are registered before
      const waitFor = dependencies[0].identifierName
      const alreadyWaiting = this._waitingForIdentifier.get(waitFor) || []
      this._waitingForIdentifier.set(waitFor, [identifier, ...alreadyWaiting])

      // If property already registered
      // just push dependencies
      if (this.has(identifier)) {
        this.pushDependency(identifier, ...dependencies)
        return
      }
    // else it's a class
    } else {
      // Update dependencies identifier
      if (this._waitingForIdentifier.size > 0) {
        for (const [identifierName, propertyNames] of this._waitingForIdentifier) {
          for (const propertyWaiting of propertyNames) {
            if (identifierName !== identifierConstructor?.name) continue

            const toUpdateIdentifier = this.getOrThrow(propertyWaiting)

            for (const index in toUpdateIdentifier.dependencies) {
              const dependency = toUpdateIdentifier.dependencies[index]

              if (dependency.identifierName !== identifierConstructor.name) continue

              dependency.identifier = identifier

              toUpdateIdentifier.dependencies[index] = dependency
            }

            this.set(toUpdateIdentifier)
          }
        }
        this._waitingForIdentifier.clear()
      }
    }

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

  private pushDependency = <T> (identifier: Identifier<T>, ...dependency: Dependency<any>[]): void => {
    const registered = this.getOrThrow<T>(identifier)
    registered.dependencies.push(...dependency)

    this.set(registered)
  }

  private updateProperty = <T> (registered: RegisterOptions<T>, { name, value }: Property<T>): void => {
    const { identifier, cache } = registered

    const toUpdate = cache || this.resolve(identifier)

    const toUpdateAsArray = toArray<T>(toUpdate)

    for (const index in toUpdateAsArray) {
      const toUpdate = toUpdateAsArray[index]
      const updated = defineObjectProperty(toUpdate, name, value)
      toUpdateAsArray[index] = updated
    }

    this.define({
      identifier,
      value: toUpdateAsArray,
      overrideIfArray: true
    })
  }

  private updateDependencyProperty = <T> (identifier: Identifier<T>, { name, value }: Property<T>): void => {
    const registered = this.getOrThrow<T>(identifier)

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

    for (const dependency of dependencies) {
      const { identifier: dependencyIdentifier, propertyName } = dependency

      if (!dependencyIdentifier)
        throw new Error(ERROR_MESSAGES.NO_DEPENDENCY_IDENTIFIER(identifier, dependency))

      this.updateDependencyProperty(
        dependencyIdentifier,
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
    overrideIfArray = false,
    updateDependencies: updateCacheDependencies = true
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

  public resolve = <T> (identifier: Identifier<T>, options?: ResolveOptions): Value<T> => {
    const { identifierConstructor, cache, isArray } = this.getOrThrow<T>(identifier)

    if (!identifierConstructor)
      return cache

    const useCache = typeof options?.useCache !== 'undefined' ? options.useCache : true

    if (useCache && cache)
      return cache

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

    const override = typeof options?.override !== 'undefined' ? options.override : true

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