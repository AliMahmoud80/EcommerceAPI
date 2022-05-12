import { IAPIError } from './IError'

export interface IResponse {
  meta?: Meta
  data?: Resource | Resource[]
  errors?: IAPIError[]
}

export interface Meta {
  first?: string
  last?: string
  next?: string | null
  prev?: string | null
}
