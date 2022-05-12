import { APIError } from '@/api/errors'
import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * NotFound API error
 */
export class NotFoundError extends APIError implements IAPIError {
  public readonly title: string = 'resource_not_found'
  public detail = 'Resource not found'
  public status = '404'

  public constructor(options?: IAPIErrorOptions) {
    super(options)

    this.setOptions(options)
  }
}
