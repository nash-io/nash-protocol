import isPlainObject from 'lodash/fp/isPlainObject'
import mapValues from 'lodash/fp/mapValues'

/*
  Partially applied function to recursively manipulate objects
  Unfortunately this is poorly typed and always returns any, so must be casted.
 */
const deep = (fn: (x: any) => any) => (obj: object): any => {
  return fn(mapValues(v => (isPlainObject(v) ? deep(fn)(v) : v), obj))
}

export default deep
