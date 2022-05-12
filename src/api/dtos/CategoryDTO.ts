import { Expose, Transform, Type } from 'class-transformer'
import {
  Equals,
  IsDefined,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator'

export class CategoryAttributes {
  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  @Expose()
  name: string

  @IsNumberString()
  @Transform(({ value }: { value: string }): number => parseInt(value), {
    toPlainOnly: true,
  })
  @Expose()
  parent_category_id?: number | null
}

export class CategoryDTO {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @Equals('Category')
  type: 'Category'

  @IsNotEmpty()
  @IsDefined()
  @ValidateNested()
  @Expose()
  @Type(() => CategoryAttributes)
  attributes: CategoryAttributes
}
