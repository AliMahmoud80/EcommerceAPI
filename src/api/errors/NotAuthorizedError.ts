import { APIError } from '@/api/errors'
import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * Not Authorized API error
 */
export class NotAuthorizedError extends APIError implements IAPIError {
  public readonly title: string = 'not_authorized'
  public detail = 'Not authorized'
  public status = '401'

  public constructor(options?: IAPIErrorOptions) {
    super(options)

    this.setOptions(options)
  }
}
