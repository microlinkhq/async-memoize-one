<div align="center">
  <img src="https://cdn.microlink.io/logo/banner.png" alt="microlink">
  <br>
  <br>
</div>

![Last version](https://img.shields.io/github/tag/microlinkhq/async-memoize-one.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/com/microlinkhq/async-memoize-one/master.svg?style=flat-square)](https://travis-ci.com/microlinkhq/async-memoize-one)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/async-memoize-one.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/async-memoize-one)
[![NPM Status](https://img.shields.io/npm/dm/async-memoize-one.svg?style=flat-square)](https://www.npmjs.org/package/async-memoize-one)

> Memoize the last result, in async way.

**async-memoize-one** simply remembers the last arguments, and if the function is next called with the same arguments then it returns the previous result.

It's used for [micro-caching](https://www.nginx.com/blog/benefits-of-microcaching-nginx/) scenarios, where you want to prevent perform an action previously done during a short period of time.

No need to worry about cache busting mechanisms such as maxAge, maxSize, exclusions and so on which can be prone to memory leaks.

## Install

```bash
$ npm install async-memoize-one --save
```

## Usage

```js
import memoizeOne from 'async-memoize-one'
import got from 'got'

const fetchData = memoizeOne(url => got(`https://api.microlink.io?url=${url}`))

;(async () => {
  // fecthing data for first time
  console.time('fetch')
  await fetchData('https://example.com/one')
  console.timeEnd('fetch')

  // served data from cache; no fetching!
  console.time('fetch')
  await fetchData('https://example.com/one')
  console.timeEnd('fetch')

  // previous execution parameters are different, so fetching again
  console.time('fetch')
  await fetchData('https://example.com/two')
  console.timeEnd('fetch')

  // previous execution parameters are different, so fetching again
  console.time('fetch')
  await fetchData('https://example.com/one')
  console.timeEnd('fetch')
})()
```

## API

### memoizeOne(fn, [isEqual], [options])

#### fn

*Required*<br>
Type: `function`

Promise-returning or async function to be memoized.

#### isEqual

Type: `function`<br>
Default: [`fast-deep-equal`](https://github.com/epoberezkin/fast-deep-equal)

The compare function to determinate if both executions are the same.

An equality function should return true if the arguments are equal. If true is returned then the wrapped function will not be called.

#### options

##### cachePromiseRejection

Type: `boolean`<br>
Default: `false`

Cache rejected promises.

## License

**async-memoize-one** © [microlink.io](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/async-memoize-one/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/async-memoize-one/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
