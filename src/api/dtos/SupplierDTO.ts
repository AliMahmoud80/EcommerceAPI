import { Expose, Type } from 'class-transformer'
import {
  Equals,
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
  IsPhoneNumber,
} from 'class-validator'

export class SupplierAttributes {
  @IsNotEmpty()
  @Length(2, 25)
  @IsAlpha()
  @Expose()
  name: string

  @IsNotEmpty()
  @IsEmail()
  @Length(5, 100)
  @Expose()
  email: string

  @IsNotEmpty()
  @IsPhoneNumber()
  @Expose()
  phone_number: string

  @IsNotEmpty()
  @IsString()
  @Expose()
  country: string

  @IsNotEmpty()
  @IsString()
  @Expose()
  region: string

  @IsNotEmpty()
  @IsString()
  @Expose()
  address: string
}

export class SupplierDTO {
  @Equals('Supplier')
  @Expose()
  type: 'Supplier'

  @ValidateNested()
  @Expose()
  @Type(() => SupplierAttributes)
  attributes: SupplierAttributes
}
