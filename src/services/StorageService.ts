import config from '@/config'
import S3 from 'aws-sdk/clients/s3'
import { ReadStream } from 'fs'
import { nanoid } from 'nanoid'
import { Service } from 'typedi'

/**
 * Class to handle the storage of files
 */
@Service()
export class StorageService {
  constructor(private s3: S3) {
    this.s3 = new S3({
      region: config.s3.bucketRegion,
      accessKeyId: config.s3.accessKey,
      secretAccessKey: config.s3.secretKey,
    })
  }

  /**
   * Save a file to the s3 bucket storage
   *
   * @param file The file to be saved
   * @returns
   */
  async save(file: Express.Multer.File): Promise<S3.ManagedUpload.SendData> {
    const fileReadStream = ReadStream.from(file.buffer)

    return this.s3
      .upload({
        Key: nanoid(),
        Bucket: config.s3.bucketName,
        Body: fileReadStream,
      })
      .promise()
  }

  /**
   * Get a file from the s3 bucket
   *
   * @param key File key
   * @returns Readstream of the file being requested
   */
  get(key: string) {
    const fileReadStrem = this.s3
      .getObject({
        Bucket: config.s3.bucketName,
        Key: key,
      })
      .createReadStream()

    return fileReadStrem
  }

  /**
   * Delete a file from the s3 bucket
   *
   * @param key File key
   * @returns
   */
  delete(key: string) {
    return this.s3
      .deleteObject({
        Key: key,
        Bucket: config.s3.bucketName,
      })
      .promise()
  }
}

export default StorageService
