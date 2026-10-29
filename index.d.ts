declare namespace memoizeOne {
  interface MemoizeOneOptions {
    /**
     * Whether to cache promise rejections.
     * @default false
     */
    cachePromiseRejection?: boolean
  }
}

/**
 * A simple async memoization library that memoizes the last result.
 *
 * @param fn - The async function to memoize
 * @param isEqual - Optional equality function to compare arguments
 * @param options - Optional configuration options
 * @returns A memoized version of the async function
 *
 * @example
 * import memoizeOne from 'async-memoize-one'
 *
 * const memoizedFetch = memoizeOne(async (url: string) => {
 *   return fetch(url).then(res => res.json())
 * })
 */
declare function memoizeOne<Args extends any[], Result extends Promise<any>>(
  fn: (this: void, ...args: Args) => Result,
  isEqual?: (newArgs: Args, oldArgs: Args) => boolean,
  options?: memoizeOne.MemoizeOneOptions
): (...args: Args) => Promise<Awaited<Result>>
declare function memoizeOne<Fn extends (this: void, ...args: any[]) => Promise<any>>(
  fn: Fn,
  isEqual?: (newArgs: Parameters<Fn>, oldArgs: Parameters<Fn>) => boolean,
  options?: memoizeOne.MemoizeOneOptions
): (...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>>>

export = memoizeOne
