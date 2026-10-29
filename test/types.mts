import memoizeOne from '../index.js'
import type { MemoizeOneOptions } from '../index.js'

const options: MemoizeOneOptions = { cachePromiseRejection: true }
const fetchUser = async (id: number): Promise<{ id: number }> => ({ id })

const memoized = memoizeOne(fetchUser)
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

console.log(identityResult, withDefaultResult, unannotated, signedResult, untypedResult)

type Fetch = (url: string) => Promise<string>
const explicit = memoizeOne<Fetch>(async url => url)
const explicitResult: Promise<string> = explicit('a')
// @ts-expect-error an explicit function type still drops its properties
console.log(memoizeOne<typeof tagged>(tagged).cacheKey, explicitResult)
