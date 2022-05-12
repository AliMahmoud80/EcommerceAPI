import { APIError } from '@/api/errors'
import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * API ConflictError
 */
export class ConflictError extends APIError implements IAPIError {
  public readonly title: string = 'conflict_error'
  public detail = 'Resource already exists'
  public status = '419'

  public constructor(options?: IAPIErrorOptions) {
    super(options)

    this.setOptions(options)
  }
}
