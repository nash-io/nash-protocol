import random from 'randombytes'

/**
 * Returns an entropy with the given number of bytes. Works in both Node and
 * the browser.
 */
export default function randomBytes(bytes: number): Buffer {
  return random(bytes)
}
