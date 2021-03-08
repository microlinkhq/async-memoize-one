'use strict'

const pReflect = require('p-reflect')
const delay = require('delay')
const test = require('ava')

const memoizeOne = require('..')

test('memoize the last call', async t => {
  let i = 0

  const call = async (...args) =>
    args.reduce((total, current) => total + current) + i

  const memoizedCall = memoizeOne(call)
  const firstResponse = await memoizedCall(1, 2, 3)

  // Perform first call
  t.is(firstResponse, 6)

  // Increment i to equal 20
  i = 20

  // Perform second call, i should equal 0 as it remembers the previous.
  const secondResponse = await memoizedCall(1, 2, 3)

  t.is(secondResponse, 6)
})

test('does not use cache on new params', async t => {
  let i = 0

  const call = async (...args) =>
    args.reduce((total, current) => total + current) + i

  const memoizedCall = memoizeOne(call)
  const firstResponse = await memoizedCall(1, 2, 3)

  // Perform first call
  t.is(firstResponse, 6)

  // Increment i to equal 20
  i = 20

  // Perform second call, because the params are different it should do a fresh call.
  const secondResponse = await memoizedCall(1, 2, 4)

  t.is(secondResponse, 27)
})

test('prevent race condition', async t => {
  let i = 0

  const call = async () => {
    const value = ++i
    return value
  }

  const memoizedCall = memoizeOne(call)

  await Promise.all([memoizedCall(), memoizedCall(), memoizedCall()])

  t.is(i, 1)
})

test('`{ cachePromiseRejection: true }`', async t => {
  let i = 0

  const call = async () => {
    const value = ++i
    if (value === 1) throw new Error('oh no')
    return value
  }

  const memoizedCall = memoizeOne(call)

  pReflect(memoizedCall())
  await delay(100)
  pReflect(memoizedCall())
  pReflect(memoizedCall())

  t.is(i, 2)
})
