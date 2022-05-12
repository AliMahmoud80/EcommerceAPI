import assert from 'assert'

assert(process.env.JWT_SECRET_KEY, 'JWT_SECRET_KEY is not defined')
assert(process.env.PASSWORD_SALT, 'PASSOWRD_SALT is not defined')

export default {
  name: process.env.APP_NAME,
  env: process.env.NODE_ENV,
  url: process.env.APP_URL,
  port: process.env.PORT,
  passwordSalt: process.env.PASSWORD_SALT,
  jwtSecret: process.env.JWT_SECRET_KEY,
  storageType: process.env.STORAGE_TYPE,
}
