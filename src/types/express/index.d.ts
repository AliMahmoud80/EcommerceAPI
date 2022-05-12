import { IUserPayload } from '@/interfaces'

declare global {
  declare namespace Express {
    export interface Request {
      rawBody: string
      requestId: string
      user: IUserPayload
    }
  }
}
