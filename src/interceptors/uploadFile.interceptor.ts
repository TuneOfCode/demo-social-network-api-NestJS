import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { env } from 'process';
import {
  allowedFileSize,
  ICustomFileInterceptor,
} from 'src/constants/uploadFile.constant';
import { fileFilter, storage } from 'src/helpers/uploadFile.helper';

export const CustomFileInterceptor = (
  options: ICustomFileInterceptor,
): Type<NestInterceptor> => {
  @Injectable()
  class UploadFileInterceptor implements NestInterceptor {
    file: NestInterceptor;
    intercept(context: ExecutionContext, next: CallHandler) {
      return this.file.intercept(context, next);
    }

    constructor() {
      const filesDestination = env.APP_ROOT_STORAGE;

      const destination = `${filesDestination}${options.localStoragePath}`;

      const multerOptions: MulterOptions = {
        storage: storage(destination),
        fileFilter: fileFilter(options.selectExt || 'image'),
        limits: {
          fileSize: (+options.limit) ** 1024 || allowedFileSize,
        },
      };
      if (options.typeUpload === 'single') {
        this.file = new (FileInterceptor(options.fieldName, multerOptions))();
      } else {
        this.file = new (FilesInterceptor(
          options.fieldName,
          options.maxCount || null,
          multerOptions,
        ))();
      }
    }
  }
  return UploadFileInterceptor;
};
