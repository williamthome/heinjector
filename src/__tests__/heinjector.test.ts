import heinjector, { Inject, Injectable } from '..'

class Foo {
  constructor (
    public readonly foo: string,
    public readonly arrayfoo: string[],
    public readonly bar: string
  ) { }
}

class Bar {
  constructor (
    public readonly foo: Foo,
    public readonly arrayfoo: string[],
    public readonly bar: string
  ) { }
}

class Foobar {
  constructor (
    public readonly foo: Foo,
    public readonly bar: Bar,
    public readonly stringfoo: string,
    public readonly arrayfoo: string[],
    public readonly stringbar: string
  ) { }
}

describe('HeinJector', () => {
  beforeEach(() => {
    heinjector.testMode = false

    Inject()(Foo, 'bar', 2)
    Inject({ isArray: true })(Foo, 'arrayFoo', 1)
    Inject()(Foo, 'foo', 0)
    Injectable({ identifier: 'Foo' })(Foo)

    Inject()(Bar, 'bar', 2)
    Inject({ isArray: true })(Bar, 'arrayFoo', 1)
    Inject({ identifier: 'Foo' })(Bar, 'foo', 0)
    Injectable()(Bar)

    Inject({ identifier: 'bar' })(Foobar, 'stringbar', 4)
    Inject({ isArray: true })(Foobar, 'arrayFoo', 3)
    Inject({ identifier: 'foo' })(Foobar, 'stringfoo', 2)
    Inject({ identifier: Bar })(Foobar, 'bar', 1)
    Inject({ identifier: 'Foo' })(Foobar, 'foo', 0)
    Injectable()(Foobar)
  })

  afterEach(() => {
    heinjector.clear()
    heinjector.testMode = false
  })

  describe('define()', () => {
    it('should throw if unregistered', () => {
      expect(() => heinjector.define({ identifier: 'not', value: 'registered' })).toThrow()
    })

    it('should not throw if on test mode', () => {
      heinjector.testMode = true
      expect(() => heinjector.define({ identifier: 'not', value: 'registered' })).not.toThrow()
    })
  })

  it('should inject, define, resolve and clear', () => {

    /// DEFINE VALUES

    heinjector.define<string>({
      identifier: 'foo',
      value: 'My foo value'
    })

    heinjector.define<string>({
      identifier: 'bar',
      value: 'My bar value'
    })

    /// DEFINE ARRAYS WITHOUT OVERRIDE

    heinjector.define<string>({
      identifier: 'arrayfoo',
      value: 'My first arrayfoo'
    })

    heinjector.define<string>({
      identifier: 'arrayfoo',
      value: 'My second arrayfoo'
    })

    heinjector.define<string>({
      identifier: 'arrayfoo',
      value: 'My third arrayfoo'
    })

    /// RESOLVE

    const foobar = heinjector.resolve<Foobar>(Foobar) as Foobar

    expect(foobar).toBeTruthy()
    expect(foobar.stringfoo).toBeTruthy()
    expect(foobar.stringfoo).toBe('My foo value')
    expect(foobar.stringbar).toBeTruthy()
    expect(foobar.stringbar).toBe('My bar value')
    expect(foobar.arrayfoo).toBeTruthy()
    expect(foobar.arrayfoo.length).toBe(3)

    expect(foobar.foo).toBeTruthy()
    expect(foobar.foo.bar).toBeTruthy()
    expect(foobar.foo.foo).toBeTruthy()
    expect(foobar.foo.arrayfoo).toBeTruthy()
    expect(foobar.foo.arrayfoo.length).toBe(3)

    expect(foobar.bar).toBeTruthy()
    expect(foobar.bar.bar).toBeTruthy()
    expect(foobar.bar.foo.bar).toBeTruthy()
    expect(foobar.bar.foo.foo).toBeTruthy()
    expect(foobar.bar.foo.arrayfoo).toBeTruthy()
    expect(foobar.bar.foo.arrayfoo.length).toBe(3)
    expect(foobar.bar.arrayfoo).toBeTruthy()
    expect(foobar.bar.arrayfoo.length).toBe(3)

    /// OVERRIDE ARRAY

    heinjector.define<string>({
      identifier: 'arrayfoo',
      value: 'My overrided arrayfoo',
      overrideIfArray: true, // <<
      updateDependencies: false
    })

    const arrayfoo = heinjector.resolve<string>('arrayfoo') as string[]

    expect(arrayfoo).toBeTruthy()
    expect(arrayfoo.length).toBe(1)

    expect(foobar.arrayfoo).toBeTruthy()
    expect(foobar.arrayfoo.length).toBe(3)

    expect(foobar.foo.arrayfoo).toBeTruthy()
    expect(foobar.foo.arrayfoo.length).toBe(3)

    expect(foobar.bar.foo.arrayfoo).toBeTruthy()
    expect(foobar.bar.foo.arrayfoo.length).toBe(3)
    expect(foobar.bar.arrayfoo).toBeTruthy()
    expect(foobar.bar.arrayfoo.length).toBe(3)

    /// OVERRIDE ARRAY UPDATING DEPENDENCIES

    heinjector.define<string>({
      identifier: 'arrayfoo',
      value: 'My second overrided arrayfoo',
      overrideIfArray: true,
      updateDependencies: true // <<
    })

    expect(arrayfoo).toBeTruthy()
    expect(arrayfoo.length).toBe(1)

    expect(foobar.arrayfoo).toBeTruthy()
    expect(foobar.arrayfoo.length).toBe(1)

    expect(foobar.foo.arrayfoo).toBeTruthy()
    expect(foobar.foo.arrayfoo.length).toBe(1)

    expect(foobar.bar.foo.arrayfoo).toBeTruthy()
    expect(foobar.bar.foo.arrayfoo.length).toBe(1)
    expect(foobar.bar.arrayfoo).toBeTruthy()
    expect(foobar.bar.arrayfoo.length).toBe(1)

    /// CLEAR REGISTERS MAP

    heinjector.clear()

    expect(() => heinjector.resolve(Foobar)).toThrow()
  })
})