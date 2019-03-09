import random from 'randombytes'

export default function randomBytes(bytes: number): Buffer {
  return random(bytes)
}
