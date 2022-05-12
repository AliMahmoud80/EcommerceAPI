import { APIError } from '@/api/errors'
import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * API Unsupported Media Type Error
 */
export class UnSupportedMediaTypeError extends APIError implements IAPIError {
  public readonly title: string = 'unsupported_media_type'
  public detail = 'Media type is not supported'
  public status = '415'

  public constructor(options?: IAPIErrorOptions) {
    super(options)

    this.setOptions(options)
  }
}
