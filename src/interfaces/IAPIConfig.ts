import { ModelStatic } from 'sequelize/types'

export interface IAPIConfig {
  resources: {
    [name: string]: ResourceConfig
  }
}

export interface ResourceConfig {
  name: string
  model: ModelStatic<any>
  accessibleFields: string[]
  requiredFields: string[]
  relations: Relation[]
}

type Relation = {
  name: string
  model: ModelStatic<any>
}
