'use strict'

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
