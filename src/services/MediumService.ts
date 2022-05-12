import { Medium } from '@/models'
import { Inject, Service } from 'typedi'
import { ModelStatic } from 'sequelize'
import { ResourceService } from './ResourceService'
import StorageService from './StorageService'
import mime from 'mime'
import { UnSupportedMediaTypeError, ValidationError } from '@/api/errors'

@Service()
export class MediumService extends ResourceService<Medium, never> {
  private allowedMediaTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
  ]

  constructor(
    @Inject('Medium') mediumModel: ModelStatic<Medium>,
    private sotrageService: StorageService
  ) {
    super(mediumModel)
  }

  /**
   * Create a new medium
   *
   * @returns Created medium
   */
  async create(userId: string, file?: Express.Multer.File): Promise<Medium> {
    try {
      if (!file) throw new ValidationError({ detail: 'No file was uploaded' })

      const savedFile = await this.sotrageService.save(file)

      const medium = await this.model.create({
        user_id: parseInt(userId),
        original_name: file.originalname,
        s3_key: savedFile.Key,
        extension: mime.extension(file.mimetype) || '',
        size: file.size,
      })

      return medium
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Delete a medium from the database and s3 bucket
   *
   * @param medium Medium to be deleted
   */
  async deleteMedium(medium: MediumModel): Promise<void> {
    try {
      const mediumKey = medium.getDataValue('s3_key')

      await medium.destroy()

      await this.sotrageService.delete(mediumKey)
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Validate uploaded file
   *
   * @param file File to be uploaded
   */
  validateFile(file?: Express.Multer.File): void {
    if (file) {
      if (this.allowedMediaTypes.includes(file.mimetype)) return
    }

    throw new UnSupportedMediaTypeError({
      meta: {
        allowed_media_types: this.allowedMediaTypes,
      },
    })
  }
}
