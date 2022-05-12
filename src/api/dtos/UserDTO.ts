import { Expose, Transform, Type } from 'class-transformer'
import {
  Equals,
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
  IsPhoneNumber,
  ValidateIf,
  IsNumberString,
} from 'class-validator'

export class UserAttributes {
  @IsNotEmpty()
  @Length(2, 25)
  @IsAlpha()
  @Expose()
  first_name: string

  @IsNotEmpty()
  @Length(2, 25)
  @IsAlpha()
  @Expose()
  last_name: string

  @IsNotEmpty()
  @IsEmail()
  @Length(5, 100)
  @Expose()
  email: string

  @IsNotEmpty()
  @Length(8, 32)
  @Expose()
  password: string

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

  @Expose()
  @ValidateIf((o: UserAttributes) => o.role_id !== undefined)
  @Transform(({ value }: { value: string }): number => parseInt(value), {
    toPlainOnly: true,
  })
  @IsNumberString()
  role_id: number
}

export class UserDTO {
  @Equals('User')
  @Expose()
  type: 'User'

  @ValidateNested()
  @Expose()
  @Type(() => UserAttributes)
  attributes: UserAttributes
}

export class UserCredentialsDTO {
  @IsNotEmpty()
  @IsEmail()
  @Length(5, 100)
  email: string

  @IsNotEmpty()
  @Length(8, 32)
  password: string
}
