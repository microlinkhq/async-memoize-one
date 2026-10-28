'use strict'

const { writeFileSync } = require('fs')
const { join } = require('path')
const { setFlagsFromString } = require('v8')
const { runInNewContext } = require('vm')

const memoizeOne = require('..')

const RUNS = 7
const CALLS = 200_000
const OPTION_KEYS = 20

setFlagsFromString('--expose-gc')
const collectGarbage = runInNewContext('gc')

const now = () => process.hrtime.bigint()

const elapsed = started => Number(now() - started) / 1e6

const median = values => {
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const createOptions = seed => {
  const options = { url: `https://example.com/${seed}`, headers: {} }
  for (let key = 0; key < OPTION_KEYS; key++) {
    options.headers[`x-header-${key}`] = `value-${key}`
  }
  options.retry = { limit: 2, methods: ['GET', 'HEAD'] }
  return options
}

const createCalls = seedOf =>
  Array.from({ length: CALLS }, (_, call) => createOptions(seedOf(call)))

const countedFn = state => async options => {
  state.calls++
  return options.url
}

const callAll = async (memoized, calls) => {
  let matched = 0
  for (const options of calls) {
    if ((await memoized(options)) === options.url) matched++
  }
  return matched
}

const hitCase = {
  name: 'memoized hit with deep equal args',
  extra: `${CALLS} calls with equal ${OPTION_KEYS}-header options objects`,
  setup: state => {
    state.calls = createCalls(() => 'same')
  },
  timed: async state => {
    const counter = { calls: 0 }
    const matched = await callAll(memoizeOne(countedFn(counter)), state.calls)
    return { matched, invocations: counter.calls }
  },
  verify: ({ matched, invocations }) => matched === CALLS && invocations === 1
}

const missCase = {
  name: 'memoized miss with changing args',
  extra: `${CALLS} calls alternating between two options objects`,
  setup: state => {
    state.calls = createCalls(call => call % 2)
  },
  timed: async state => {
    const counter = { calls: 0 }
    const matched = await callAll(memoizeOne(countedFn(counter)), state.calls)
    return { matched, invocations: counter.calls }
  },
  verify: ({ matched, invocations }) =>
    matched === CALLS && invocations === CALLS
}

const CASES = [hitCase, missCase]

const fmt = value => value.toFixed(1)

const report = slot => {
  const med = slot.walls.length ? median(slot.walls) : Number.NaN
  const min = slot.walls.length ? Math.min(...slot.walls) : Number.NaN
  const max = slot.walls.length ? Math.max(...slot.walls) : Number.NaN
  const extra = `${slot.entry.extra}, errors ${slot.errors}, runs ${RUNS}`
  console.log(
    `${slot.entry.name}  median ${fmt(med)}ms  range ${fmt(min)}-${fmt(
      max
    )}  ${extra}`
  )
  return {
    name: slot.entry.name,
    unit: 'ms',
    value: Number(med.toFixed(1)),
    range: `${fmt(min)}-${fmt(max)}`,
    extra
  }
}

const takeSample = async (slot, run) => {
  try {
    collectGarbage()
    const started = now()
    const outcome = await slot.entry.timed(slot.state)
    const wall = elapsed(started)
    if (!slot.entry.verify(outcome)) {
      console.error(`${slot.entry.name} run ${run} produced unexpected output`)
      slot.errors++
      return
    }
    slot.walls.push(wall)
  } catch (error) {
    console.error(error)
    slot.errors++
  }
}

const main = async () => {
  const slots = []
  for (const entry of CASES) {
    const state = {}
    entry.setup(state)
    await entry.timed(state)
    slots.push({ entry, state, walls: [], errors: 0 })
  }
  for (let run = 0; run < RUNS; run++) {
    for (const slot of slots) await takeSample(slot, run)
  }
  const results = slots.map(report)
  writeFileSync(
    join(__dirname, '..', 'benchmark-output.json'),
    JSON.stringify(results, null, 2) + '\n'
  )
  const errors = slots.reduce((total, slot) => total + slot.errors, 0)
  if (errors > 0 || results.some(result => !Number.isFinite(result.value))) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
