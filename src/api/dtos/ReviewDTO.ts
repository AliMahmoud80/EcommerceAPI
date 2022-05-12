import { Expose, Type } from 'class-transformer'
import {
  Equals,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

export class ReviewAttributes {
  @IsNotEmpty()
  @IsNumberString()
  @Expose()
  product_id: string

  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  @Expose()
  content: string

  @IsNotEmpty()
  @IsInt()
  @Max(10)
  @Min(1)
  @Expose()
  rate: number
}

export class ReviewDTO {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @Equals('Review')
  type: 'Review'

  @IsNotEmpty()
  @IsDefined()
  @ValidateNested()
  @Expose()
  @Type(() => ReviewAttributes)
  attributes: ReviewAttributes
}
