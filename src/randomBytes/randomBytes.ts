import random from 'node-forge/lib/random'

export default function randomBytes(bytes: number): Buffer {
  // If needed, can add a callback and promisify this
  return Buffer.from(random.getBytes(bytes), 'binary')
}
