// Returns the snake cased version of the given object.
export default function snakeCase(obj: Record<string, any>): object {
  const snakeCased: Record<string, any> = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = obj[key]
      snakeCased[snakeCaseString(key)] = val
    }
  }

  return snakeCased
}

function snakeCaseString(str: string): string {
  const separator = '_'

  return str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
    .toLowerCase()
}
