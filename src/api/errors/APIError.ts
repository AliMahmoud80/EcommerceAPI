import { IAPIError, IAPIErrorOptions } from '@/interfaces'

/**
 * General API error
 */
export class APIError extends Error implements IAPIError {
  public readonly title: string = 'general_error'
  public detail = 'Unknown error occured'
  public status = '500'
  public meta: any
  public source: any

  constructor(options?: IAPIErrorOptions) {
    super()
    this.setOptions(options)
  }

  setOptions(options?: IAPIErrorOptions) {
    if (options) {
      this.status = options.status || this.status
      this.detail = options.detail || this.detail
      this.meta = options.meta || this.meta
      this.source = options.source || this.source
    }
  }
}
