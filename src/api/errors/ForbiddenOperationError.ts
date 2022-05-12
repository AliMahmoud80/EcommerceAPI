import { APIError } from '@/api/errors'
import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * ForbiddenOperation API error
 */
export class ForbiddenOperation extends APIError implements IAPIError {
  public readonly title: string = 'forbidden_operation'
  public detail = 'Forbidden operation'
  public status = '403'

  public constructor(options?: IAPIErrorOptions) {
    super(options)

    this.setOptions(options)
  }
}
