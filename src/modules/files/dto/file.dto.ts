import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsString } from 'class-validator';
export class CreateFileDto {
  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsNumber()
  size?: number;

  @IsString()
  type?: string;
}
export class UpdateFileDto extends PartialType(CreateFileDto) {
  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsNumber()
  size?: number;

  @IsString()
  type?: string;
}
