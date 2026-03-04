export interface MemoizeOneOptions {
  /**
   * Whether to cache promise rejections.
   * @default false
   */
  cachePromiseRejection?: boolean
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
export default function memoizeOne<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  isEqual?: (newArgs: any[], oldArgs: any[]) => boolean,
  options?: MemoizeOneOptions
): T
