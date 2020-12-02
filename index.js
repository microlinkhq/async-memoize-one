'use strict'

const deepEqual = require('fast-deep-equal')

const memoizeOne = (fn, isEqual = deepEqual) => {
  if (!fn) throw new TypeError('You have to provide a `fn` function.')

  let calledOnce = false
  let oldArgs
  let lastResult

  return async (...newArgs) => {
    if (calledOnce && isEqual(newArgs, oldArgs)) return lastResult

    lastResult = await fn(...newArgs)
    calledOnce = true
    oldArgs = newArgs

    return lastResult
  }
}

module.exports = memoizeOne
