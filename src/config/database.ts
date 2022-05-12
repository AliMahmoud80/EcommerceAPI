import assert from 'assert'

assert(process.env.DB_HOST, 'DB_HOST is not defined')
assert(process.env.DB_PORT, 'DB_PORT is not defined')
assert(process.env.DB_DATABASE, 'DB_DATABASE is not defined')
assert(process.env.DB_USERNAME, 'DB_USERNAME is not defined')
assert(process.env.DB_PASSWORD, 'DB_PASSWORD is not defined')

const port = parseInt(process.env.DB_PORT) || 3306

export default {
  host: process.env.DB_HOST,
  port: port,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
}
