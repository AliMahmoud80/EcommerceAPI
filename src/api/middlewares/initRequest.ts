import { ACLService } from '@/services'
import { Request, Response, NextFunction } from 'express'
import Container from 'typedi'
import { v4 as uuidv4 } from 'uuid'

/**
 * Initialize request
 *
 * @param req Request object
 * @param _ Response object
 * @param next Next function
 */
export default async function InitRequest(
  req: Request,
  _: Response,
  next: NextFunction
) {
  // Generate request id
  req.requestId = uuidv4()

  // Create DI container for this request and
  // Inject the request into the DI container
  Container.of(req.requestId).set<Request>('REQUEST_CONTEXT', req)

  // Initiate ACL service then
  // attach it to the DI container and the request
  const aclService = Container.get(ACLService)
  await aclService.init(req.user)
  Container.of(req.requestId).set('ACLService', aclService)

  next()
}
