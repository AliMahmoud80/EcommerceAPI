import { Router, Request, Response, NextFunction } from 'express'
import { StorageService } from '@/services'
import { NotFoundError } from '@/api/errors'
import Container from 'typedi'
import mime from 'mime'

const router = Router()

router.get(
  '/storage/:key.:extension',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.key

      if (!key) throw new NotFoundError()

      const storageService = Container.get(StorageService)
      const file = storageService.get(key).once('error', () => {
        next(new NotFoundError())
      })

      file.pipe(res).contentType(mime.lookup(req.params.extension))
    } catch (e) {
      next(e)
    }
  }
)

export default router
