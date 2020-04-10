/**
 * Converts a hex string to a buffer. Used for consistency to ensure the
 * proper canonical string representation for buffers.
 *
 * See `bufferize.ts`.
 */
export default function bufferize(str: string): Buffer {
  return Buffer.from(str, 'hex')
}
