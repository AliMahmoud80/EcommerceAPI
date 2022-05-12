import { Request, Response, NextFunction } from 'express'
import Container from 'typedi'

/**
 * Clean up after request
 *
 * @param req Request object
 * @param _ Response object
 * @param next Next function
 */
export default function postRequest(
  req: Request,
  _: Response,
  next: NextFunction
) {
  // Reset DI container
  Container.of(req.requestId).reset()

  next()
}
