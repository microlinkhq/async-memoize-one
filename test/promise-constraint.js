'use strict'

const { spawnSync } = require('child_process')
const path = require('path')
const test = require('ava').default

test('both overloads constrain the result to Promise<unknown>', t => {
  const tsc = path.join(
    path.dirname(require.resolve('typescript/package.json')),
    'lib',
    'tsc.js'
  )
  const result = spawnSync(
    process.execPath,
    [
      tsc,
      '--noEmit',
      '--strict',
      '--module',
      'nodenext',
      '--moduleResolution',
      'nodenext',
      '--target',
      'es2022',
      '--pretty',
      'false',
      'test/promise-constraint.mts'
    ],
    { encoding: 'utf8' }
  )
  const output = `${result.stdout || ''}${result.stderr || ''}`

  t.not(result.status, 0)
  t.false(output.includes('Promise<any>'))
  // The inference overload names `Promise<unknown>` once. The explicit overload names it twice.
  t.is(output.split('Promise<unknown>').length - 1, 3)
})
