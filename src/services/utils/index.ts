import config from '@/config'
import { scryptSync } from 'crypto'

/**
 * Hash password
 *
 * @param password Plain password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  const passwordSalt = config.app.passwordSalt

  const hashedPassword = scryptSync(password, Buffer.from(passwordSalt), 64)

  return hashedPassword.toString('hex')
}
