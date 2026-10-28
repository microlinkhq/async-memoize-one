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
