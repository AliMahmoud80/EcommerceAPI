import { Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { NotAuthorizedError } from '@/api/errors'
import { AuthService } from '@/services'
import { IUserPayload } from '@/interfaces'

/**
 * Validate user JWT token and attach user payload to the request
 * If not a valid JWT token it will set user as undefined
 *
 * @param req Request
 * @param _ Response
 * @param next NextFunction
 */
export function authenticate(req: Request, _: Response, next: NextFunction) {
  const authService = Container.get(AuthService)

  try {
    const verifiedUser: IUserPayload = authService.verifyToken(
      req.cookies.master_access_token
    )

    req.user = verifiedUser
  } catch (e) {
    // Do nothing user is undefined by default
    // req.user = undefined
  }

  next()
}

/**
 * Check if user is authenticated or throw an API error
 *
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns
 */
export function isAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) next(new NotAuthorizedError())

  next()
}
