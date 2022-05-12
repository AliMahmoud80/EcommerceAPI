import { APIError } from '@/api/errors'
import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * PageOutOfBounds API error
 */
export class PageOutOfBoundsError extends APIError implements IAPIError {
  public readonly title: string = 'page_out_of_bounds'
  public detail = 'Invalid page number'
  public status = '404'

  public constructor(options?: IAPIErrorOptions) {
    super(options)

    this.setOptions(options)
  }
}
