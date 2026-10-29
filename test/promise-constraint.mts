import memoizeOne from '../index.js'

// Two type arguments select the inference overload.
memoizeOne<[number], PromiseLike<number>>((id: number) => Promise.resolve(id))
// One type argument selects the explicit-function overload.
memoizeOne<(id: number) => PromiseLike<number>>((id: number) => Promise.resolve(id))
