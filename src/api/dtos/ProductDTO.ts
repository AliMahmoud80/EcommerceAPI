import { Expose, Type } from 'class-transformer'
import {
  Equals,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
  IsNumber,
  Min,
  IsInt,
  IsArray,
  IsUrl,
  IsNumberString,
  IsObject,
  ValidateIf,
} from 'class-validator'

export class ProductAttributes {
  @IsNotEmpty()
  @Length(5, 255)
  @IsString()
  @Expose()
  title: string

  @IsNotEmpty()
  @Length(5, 100)
  @IsString()
  @Expose()
  content: string

  @IsNotEmpty()
  @IsNumber()
  @Expose()
  price: number

  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Expose()
  stock: number

  @IsNotEmpty()
  @Expose()
  @IsArray()
  @IsUrl({}, { each: true })
  thumbnails: string[]

  @IsNumberString()
  @Expose()
  @ValidateIf((o: ProductAttributes) => o.category_id)
  category_id: string

  @IsObject()
  @Expose()
  additional_attributes: string
}

export class ProductDTO {
  @Equals('Product')
  @Expose()
  type: 'Product'

  @ValidateNested()
  @Expose()
  @Type(() => ProductAttributes)
  attributes: ProductAttributes
}
