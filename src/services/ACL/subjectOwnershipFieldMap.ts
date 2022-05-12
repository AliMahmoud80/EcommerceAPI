/**
 * Object maps subject name to its ownership field name
 * This ownership field will be used to check if the user is the owner of the subject
 */
const subjectOwnershipFieldMapper: { [k: string]: string } = {
  user: 'id',
  review: 'user_id',
  medium: 'user_id',
  order: 'user_id',
  payment: 'user_id',
  supplier: 'user_id',
  product: 'supplier_id',
}

export default subjectOwnershipFieldMapper
