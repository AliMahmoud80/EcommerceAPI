import config from '@/config'
import { createLogger, format, transports } from 'winston'

const { label, timestamp, printf } = format

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

const appTransports = []

// Choosing winston transports
// to log to console only for development
// and log to files in production
if (config.app.env === 'development') {
  appTransports.push(new transports.Console())
} else if (config.app.env === 'production') {
  appTransports.push(new transports.Console())
  appTransports.push(
    new transports.File({
      filename: 'info.logs',
      dirname: __dirname + '../../logs/',
      level: 'info',
    })
  )
  appTransports.push(
    new transports.File({
      filename: 'errors.logs',
      dirname: __dirname + '../../logs/',
      level: 'error',
    })
  )
  appTransports.push(new transports.File({ filename: 'all.log' }))
}

const logger = createLogger({
  level: config.winston.level,
  defaultMeta: { service: process.env.APP_NAME },
  transports: appTransports,
  format: format.combine(
    label({ label: config.winston.label }),
    format.colorize(),
    timestamp(),
    loggerFormat
  ),
})

export default logger
