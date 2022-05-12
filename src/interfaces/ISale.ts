export interface ISaleResource {
  id: string
  type: 'Sale'
  attributes: {
    product_id: string
    quantity: number
  }
}
