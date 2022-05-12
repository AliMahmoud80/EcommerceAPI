import { APIError } from '@/api/errors'
import { IAPIErrorOptions } from '@/interfaces'

/**
 * Bad request error
 */
export class BadRequest extends APIError {
  public readonly title: string = 'bad_request'
  public detail = 'Bad request'
  public status = '400'
  public meta: any
  public source: any

  constructor(options?: IAPIErrorOptions) {
    super()

    this.setOptions(options)
  }
}
