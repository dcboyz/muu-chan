import { randomBytes } from 'crypto'

export function generateSafeToken() {
  const bytes = randomBytes(64)

  return bytes.toString('hex').substring(0, 128)
}
