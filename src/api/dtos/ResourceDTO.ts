import { IsNotEmpty, IsNumberString } from 'class-validator'

export class ResourceIdDTO {
  @IsNotEmpty()
  @IsNumberString()
  id: string
}
