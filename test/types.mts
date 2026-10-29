import memoizeOne from '../index.js'
import type { MemoizeOneOptions } from '../index.js'

const options: MemoizeOneOptions = { cachePromiseRejection: true }
const falseOptions: MemoizeOneOptions = { cachePromiseRejection: false }
const omittedOptions: MemoizeOneOptions = {}
const fetchUser = async (id: number): Promise<{ id: number }> => ({ id })

const memoized = memoizeOne(fetchUser)
// @ts-expect-error parameters stay required
memoized()
// @ts-expect-error there is no second parameter
memoized(1, 2)
// @ts-expect-error fn is required
memoizeOne()
memoizeOne(fetchUser, undefined, falseOptions)
memoizeOne(fetchUser, undefined, omittedOptions)
memoizeOne(fetchUser, undefined, { cachePromiseRejection: false })
// @ts-expect-error cachePromiseRejection is boolean
memoizeOne(fetchUser, undefined, { cachePromiseRejection: 'yes' })
// @ts-expect-error unknown option
memoizeOne(fetchUser, undefined, { extra: true })
// @ts-expect-error null is not a comparator
memoizeOne(fetchUser, null)
// @ts-expect-error options are not a comparator
memoizeOne(fetchUser, { cachePromiseRejection: true })
const withEquality = memoizeOne(fetchUser, (newArgs, oldArgs) => newArgs[0] === oldArgs[0], options)

const user: Promise<{ id: number }> = memoized(1)
const sameUser: Promise<{ id: number }> = withEquality(1)

// @ts-expect-error module.exports is the function itself, it has no `default` property
console.log(memoizeOne.default, user, sameUser)

const tagged = Object.assign(async (id: number) => ({ id }), { cacheKey: 'user' })
// @ts-expect-error the memoized function is a new function, properties on `fn` are not copied
console.log(memoizeOne(tagged).cacheKey)

const account = {
  base: 1,
  async add (this: { base: number }, amount: number) {
    return this.base + amount
  }
}
// @ts-expect-error `fn` is called without `this`
memoizeOne(account.add)

const parseJson = (json: string) => JSON.parse(json)
const parsed = memoizeOne(parseJson)('1')
// @ts-expect-error the memoized function always returns a Promise, even when `fn` returns `any`
const parsedNumber: number = parsed
console.log(parsedNumber)

const identity = memoizeOne(async <Value,>(value: Value) => value)
const identityResult: Promise<string> = identity('a')

// @ts-expect-error a rejected thenable has no `.catch`, so it would stay cached
memoizeOne((id: number): PromiseLike<number> => Promise.resolve(id))

const withDefault = memoizeOne(async (a: number, b = 2) => a + b)
const withDefaultResult: Promise<number> = withDefault(1)

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
const empty = memoizeOne(async () => {})
const emptyIsVoid: Equal<ReturnType<typeof empty>, Promise<void>> = true
const nulled = memoizeOne(async () => null)
const nulledIsNull: Equal<ReturnType<typeof nulled>, Promise<null>> = true
const fromUndefined = memoizeOne(async () => undefined)
const fromUndefinedIsUndefined: Equal<ReturnType<typeof fromUndefined>, Promise<undefined>> = true
const counted: Promise<number> = memoizeOne(async (...nums: number[]) => nums.length)(1, 2)
// @ts-expect-error rest arguments are numbers
memoizeOne(async (...nums: number[]) => nums.length)('a')

const unannotated: (url: string) => Promise<string> = memoizeOne(async url => String(url))

const signed = memoizeOne((n: number) => (n > 0 ? Promise.resolve('positive') : Promise.resolve(0)))
const signedResult: Promise<string | number> = signed(1)

declare const untyped: any
const untypedResult: Promise<any> = memoizeOne(untyped)('a')

const byId = memoizeOne(fetchUser, ([newId], [oldId]) => {
  const id: number = newId
  return id === oldId
})
// @ts-expect-error arguments are checked against `fn` parameters
byId('1')

memoizeOne(fetchUser, ([newId], [oldId]) => {
  // @ts-expect-error comparator arguments are `fn`'s parameter types
  const id: string = newId
  // @ts-expect-error previous arguments are `fn`'s parameter types too
  const previous: string = oldId
  return id === previous
})
// @ts-expect-error the comparator has to return a boolean
memoizeOne(fetchUser, () => 1)

declare function promiseOf<T> (value: T): Promise<T>
const nested = memoizeOne((n: number) => promiseOf(promiseOf(n)))
const nestedResult: Promise<number> = nested(1)

console.log(identityResult, withDefaultResult, unannotated, signedResult, untypedResult, nestedResult, emptyIsVoid, nulledIsNull, fromUndefinedIsUndefined, counted)

type Fetch = (url: string) => Promise<string>
const explicit = memoizeOne<Fetch>(async url => url)
const explicitResult: Promise<string> = explicit('a')
// @ts-expect-error an explicit function type still requires its parameters
explicit()
// @ts-expect-error an explicit function type still checks arguments
explicit(1)
// @ts-expect-error an explicit function type still rejects extra arguments
explicit('a', true)
// @ts-expect-error an explicit function type still requires fn
memoizeOne<Fetch>()
// @ts-expect-error null is not a comparator
memoizeOne<Fetch>(async url => url, null)
// @ts-expect-error options are not a comparator
memoizeOne<Fetch>(async url => url, { cachePromiseRejection: true })
// @ts-expect-error an explicit function type still drops its properties
console.log(memoizeOne<typeof tagged>(tagged).cacheKey, explicitResult)

memoizeOne<Fetch>(async url => url, ([url], [previous]) => {
  // @ts-expect-error an explicit function type still types comparator arguments
  const port: number = url
  // @ts-expect-error previous arguments keep that explicit function type too
  const earlier: number = previous
  return port === earlier
})
// @ts-expect-error an explicit function type still requires a boolean comparator
memoizeOne<Fetch>(async url => url, () => 1)

type Nested = (n: number) => Promise<Promise<number>>
const nestedExplicit: Promise<number> = memoizeOne<Nested>(n => promiseOf(promiseOf(n)))(1)
console.log(nestedExplicit)
