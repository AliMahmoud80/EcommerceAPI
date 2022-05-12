import assert from 'assert'

assert(process.env.AWS_BUCKET_NAME, 'AWS_BUCKET_NAME is required')

export default {
  bucketName: process.env.AWS_BUCKET_NAME,
  bucketRegion: process.env.AWS_BUCKET_REGION,
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_SECRET_KEY,
}
