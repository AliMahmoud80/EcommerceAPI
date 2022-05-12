import { FindOptions } from 'sequelize'
import { APIConfig } from '@/api/configs'
import { ValidationError } from '@/api/errors'
import { IAPIConfig, ResourceConfig } from '@/interfaces'

/**
 * Class responsible for parsing request query parameters to
 * build sequelize fetch options {@link FindOptions}
 * that will be used in querying data from the database
 */
export class QueryOptionsBuilder {
  /**
   * Current resource API configuration
   */
  private resourceConfig: ResourceConfig

  /**
   * Sequelize query options {@link FindOptions}
   */
  private options: FindOptions

  constructor(resourceType: keyof IAPIConfig['resources']) {
    this.options = {
      include: [],
    }

    this.resourceConfig = APIConfig.resources[resourceType]

    // Making sure that resource type is configures
    if (!this.resourceConfig)
      throw new Error('Resource type must be configured')
  }

  /**
   * Parse pagination parameters (page and limit) query parameters
   * then, adds the neccessary options.
   *
   * @param pageQueryParam Page query parameter
   * @param limitQueryParam Limit query parameter
   * @throws {PageOutOfBoundsError} When requesting a page out of bounding from available pages
   * @returns {QueryOptionsBuilder} current instance
   */
  addPaginationOptions(
    pageQueryParam: any,
    limitQueryParam: any
  ): QueryOptionsBuilder {
    const page = parseInt(pageQueryParam) || 1
    const limit = parseInt(limitQueryParam) || 10

    const offset = (page - 1) * limit

    this.options.limit = limit
    this.options.offset = offset

    return this
  }

  /**
   * Parse Sort query parameter and adds the neccessary options
   *
   * @param sortQueryParam Sort query parameter
   * @throws {ValidationError} When sort parameter is invalid or
   *  when trying to sort by an unknown field
   * @returns {QueryOptionsBuilder} current instance
   */
  addOrderOptions(sortQueryParam: any): QueryOptionsBuilder {
    const accessibleFields = this.resourceConfig.accessibleFields

    const orderOptons: FindOptions['order'] = []

    if (!sortQueryParam) return this

    if (!(typeof sortQueryParam === 'string'))
      throw new ValidationError({ detail: 'Invalid sort parameter value' })

    new Set(sortQueryParam.split(',')).forEach((field) => {
      let fieldName = field
      let sortDir = 'asc'

      // If field name is prefixed with a minus (-)
      // then sort direction is in descending order
      if (field[0] === '-') {
        fieldName = field.slice(1)
        sortDir = 'desc'
      }

      if (!accessibleFields?.includes(fieldName))
        throw new ValidationError({
          detail: 'Invalid field name ' + fieldName,
          source: {
            parameter: 'sort',
            value: fieldName,
          },
        })

      orderOptons.push([fieldName, sortDir])
    })

    this.options.order = orderOptons

    return this
  }

  /**
   * Parse include query parameter and adds the neccessary options
   *
   * @param includeQueryParam Include query parameter
   * @throws {ValidationError} When include parameter is invalid or
   *  when trying to include an unknown relationship
   * @returns {QueryOptionsBuilder} current instance
   */
  addIncludeOptions(includeQueryParam: any): QueryOptionsBuilder {
    const relations = this.resourceConfig.relations

    let requestedRelations = new Set()

    if (!includeQueryParam) return this

    if (!(typeof includeQueryParam === 'string'))
      throw new ValidationError({
        detail: 'Invalid include parameter value',
        source: {
          parameter: 'include',
          value: includeQueryParam,
        },
      })

    requestedRelations = new Set(includeQueryParam.split(','))

    const included: FindOptions['include'] = []

    requestedRelations.forEach((relation: any) => {
      const relationObject = relations.find((o) => o.name === relation)

      if (!relationObject)
        throw new ValidationError({
          detail: 'Invalid relationship ' + relation,
          source: {
            parameter: 'include',
            value: relation,
          },
        })

      included.push({ model: relationObject.model })
    })

    this.options.include = included

    return this
  }

  /**
   * Parse fields query parameter and adds the neccessary options
   *
   * @param fieldsQueryParam Fields query parameter
   * @returns {QueryOptionsBuilder} current instance
   */
  addFieldsOptions(fieldsQueryParam: any): QueryOptionsBuilder {
    if (typeof fieldsQueryParam === 'string')
      throw new ValidationError({ detail: 'Invalid fields parameter' })

    Object.keys(fieldsQueryParam).forEach((resourceType: any) => {
      // Check if resource type exists
      const currentResourceConfigKey = Object.keys(APIConfig.resources).find(
        (key) => key === resourceType
      )

      if (!currentResourceConfigKey)
        throw new ValidationError({
          detail: "Resource type doesn't exist",
          source: {
            parameter: 'fields',
            value: resourceType,
          },
        })

      const resorceConfigs = APIConfig.resources[currentResourceConfigKey]

      // Check if current resource type
      if (resorceConfigs.model === this.resourceConfig.model) {
        const requestedFields = fieldsQueryParam[resourceType].split(',')

        const fields = new Set([
          ...requestedFields,
          ...resorceConfigs.requiredFields,
        ])

        // remove empty value
        fields.delete('')

        requestedFields.forEach((field: any) => {
          if (!resorceConfigs.accessibleFields.includes(field)) {
            throw new ValidationError({
              detail: `Field ${field} doesn't exist on resource type ${resorceConfigs.name}`,
            })
          }
        })

        this.options.attributes = Array.from(fields) as string[]

        return
      }

      // Check if resource type is related
      const relationObj = this.resourceConfig.relations.find(
        (o) => o.model === resorceConfigs.model
      )

      if (!relationObj)
        throw new ValidationError({
          detail: 'Invalid relationship',
          source: {
            parameter: 'fields',
            value: resourceType,
          },
        })

      // Check if resource type is included
      // @ts-ignore
      const includedObj = this.options.include.find(
        (o: any) => o.model === resorceConfigs.model
      )

      if (includedObj) {
        const fields = new Set([
          ...fieldsQueryParam[resourceType].split(','),
          ...resorceConfigs.requiredFields,
        ])

        // remove empty value
        fields.delete('')

        fields.forEach((field: any) => {
          if (!resorceConfigs.accessibleFields.includes(field)) {
            throw new ValidationError({
              detail: `Field ${field} doesn't exist on resource type ${resorceConfigs.name}`,
            })
          }
        })

        includedObj.attributes = Array.from(fields)
      }
    })

    return this
  }

  /**
   * Parse filter query parameter and adds the neccessary options
   *
   * @param filterQueryParam Filter query parameter
   * @returns {QueryOptionsBuilder} current instance
   */
  // addFilterOptions(filterQueryParam: any) {
  //   return this
  // }

  /**
   * Build the query options
   *
   * @param queryParams Request query paramters
   */
  build(queryParams: QueryParams) {
    this.addPaginationOptions(queryParams.page, queryParams.limit)

    if (queryParams.sort) this.addOrderOptions(queryParams.sort)

    if (queryParams.include) this.addIncludeOptions(queryParams.include)

    if (queryParams.fields) this.addFieldsOptions(queryParams.fields)

    // if (queryParams.filter) this.addFilterOptions(queryParams.fields)

    return this.options
  }

  /**
   * Getter for query options
   *
   * @returns {FindOptions} sequelize model query options
   */
  getOptions(): FindOptions {
    return this.options
  }
}
