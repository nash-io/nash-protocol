import Keccak from 'sha3'

export default function Keccak256(data: string): Buffer {
  const hash = new Keccak(256)
  return hash.update(data).digest()
}
