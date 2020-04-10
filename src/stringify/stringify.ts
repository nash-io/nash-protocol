/**
 * Converts a buffer to a hex string. Used for consistency to ensure the
 * proper canonical string representation for buffers.
 *
 * See `bufferize.ts`.
 */
export default function stringify(buffer: Buffer): string {
  return buffer.toString('hex')
}
