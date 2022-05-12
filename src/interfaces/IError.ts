export interface IAPIError {
  meta?: any
  title: string
  detail: string
  status: string
  source?: ErrorSource
}

export interface IAPIErrorOptions {
  status?: string
  detail?: string
  meta?: any
  source?: ErrorSource
}

export type ErrorSource = {
  attribute?: string
  parameter?: string | null
  value?: unknown
}
