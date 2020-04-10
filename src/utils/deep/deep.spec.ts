import mapKeys from 'lodash/fp/mapKeys'

import deep from './deep'

// tslint:disable:object-literal-sort-keys
it('deeply iterates over nested objects', () => {
  const object = {
    foo: 1,
    bar: {
      baz: 2,
      quux: {
        quuz: 3
      }
    }
  }

  const output = deep(mapKeys((x: string) => x.toUpperCase()))(object)

  expect(output).toEqual({
    FOO: 1,
    BAR: {
      BAZ: 2,
      QUUX: {
        QUUZ: 3
      }
    }
  })
})
