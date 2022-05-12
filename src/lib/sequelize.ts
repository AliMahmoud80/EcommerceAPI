import { Sequelize } from 'sequelize'
import logger from './winston'
import config from '@/config'

const dbConfig = config.database

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: (...msg) => logger.info(msg.toString()),
    dialectOptions: { ssl: {} },
  }
)
export default sequelize
