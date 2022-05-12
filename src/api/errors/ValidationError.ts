import { APIError } from '@/api/errors'
import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * API ValidationError
 */
export class ValidationError extends APIError implements IAPIError {
  public readonly title: string = 'validation_error'
  public detail = 'Invalid data provided'
  public status = '422'

  public constructor(options?: IAPIErrorOptions) {
    super(options)

    this.setOptions(options)
  }
}
