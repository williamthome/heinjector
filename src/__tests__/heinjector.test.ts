import heinjector, { Inject, Injectable } from '..'

@Injectable({
  identifier: 'Foo'
})
class Foo {
  constructor (
    @Inject() public readonly foo: string,
    @Inject({ isArray: true }) public readonly arrayfoo: string[],
    @Inject() public readonly bar: string
  ) { }
}

@Injectable()
class Bar {
  constructor (
    @Inject({ identifier: 'Foo' }) public readonly foo: Foo,
    @Inject({ isArray: true }) public readonly arrayfoo: string[],
    @Inject() public readonly bar: string
  ) { }
}

@Injectable()
class Foobar {
  constructor (
    @Inject({ identifier: 'Foo' }) public readonly foo: Foo,
    @Inject({ identifier: Bar }) public readonly bar: Bar,
    @Inject({ identifier: 'foo' }) public readonly stringfoo: string,
    @Inject({ isArray: true }) public readonly arrayfoo: string[],
    @Inject({ identifier: 'bar' }) public readonly stringbar: string
  ) { }
}

describe('HeinJector', () => {
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
      overrideIfArray: true // <<
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