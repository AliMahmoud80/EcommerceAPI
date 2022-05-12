import { ModelStatic } from 'sequelize'
import { Container } from 'typedi'
import logger from './winston'

export default ({
  sequelizeModels,
}: {
  sequelizeModels: { [name: string]: ModelStatic<any> }
}) => {
  try {
    Container.set('logger', logger)
    logger.silly('Winston logger injected into container')

    Object.keys(sequelizeModels).forEach((modelName) => {
      Container.set(modelName, sequelizeModels[modelName])
    })
    logger.silly('Sequelize Models injected into container')
  } catch (e) {
    logger.error('Error occured in dependency intjector')
  }
}
