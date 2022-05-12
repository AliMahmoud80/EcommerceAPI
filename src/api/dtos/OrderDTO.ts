import { Expose, Type } from 'class-transformer'
import {
  Equals,
  IsArray,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  ValidateNested,
} from 'class-validator'

export class OrderProducts {
  @IsNotEmpty()
  @IsNumberString()
  @Expose()
  id: string

  @IsNotEmpty()
  @IsInt()
  @Expose()
  quantity: number
}

export class OrderAttributes {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProducts)
  @Expose()
  order_products: OrderProducts[]
}

export class OrderDTO {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @Equals('Order')
  type: 'Order'

  @IsNotEmpty()
  @IsDefined()
  @Expose()
  @ValidateNested()
  @Type(() => OrderAttributes)
  attributes: OrderAttributes
}
