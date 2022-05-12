import { Expose, Type } from 'class-transformer'
import {
  ArrayUnique,
  Equals,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator'

export class RoleAttributes {
  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @IsNumberString({}, { each: true })
  permissions_ids: string[]
}

export class RoleDTO {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @Equals('Role')
  type: 'Role'

  @IsNotEmpty()
  @IsDefined()
  @ValidateNested()
  @Expose()
  @Type(() => RoleAttributes)
  attributes: RoleAttributes
}
