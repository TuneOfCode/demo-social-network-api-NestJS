import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
export class CreateLinksPreviewDto {
  @IsString()
  url: string;

  title?: string;

  description?: string;

  thumbnail?: string;

  linkIframe?: string;
}

export class UpdateLinksPreviewDto extends PartialType(CreateLinksPreviewDto) {
  @IsString()
  url: string;

  title?: string;

  description?: string;

  thumbnail?: string;

  linkIframe?: string;
}
