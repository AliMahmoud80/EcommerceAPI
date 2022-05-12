import { ACLService } from '@/services'
import { Inject } from 'typedi'

export abstract class JsonResource<ModelType, IResource extends Resource> {
  /**
   * User ability instance.
   */
  @Inject('ACLService')
  aclService: ACLService

  /**
   * Convert sequelize model instance to json API resource style.
   *
   * @param model Sequelize model
   * @return Resource object
   */
  abstract toResource(model: ModelType): IResource

  /**
   * Convert Array of sequelize data models to API resources style.
   * This function depends on toResource {@link toResource} as it
   * iterates over each model instance and apply the function on it.
   *
   * @param models Array of sequelize models
   * @return Resources objects
   */
  toArrayOfResources(models: ModelType[]): IResource[] {
    const resources: IResource[] = []

    models.forEach((model) => resources.push(this.toResource(model)))

    return resources
  }
}
