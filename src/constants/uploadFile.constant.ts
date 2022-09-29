import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
export interface ICustomFileInterceptor {
  typeUpload: 'single' | 'multiple';
  fieldName: string;
  maxCount?: number;
  selectExt?:
    | 'image'
    | 'video'
    | 'other'
    | 'image & video'
    | 'image & other'
    | 'video & other'
    | 'all';
  localStoragePath?: string;
  limit?: MulterOptions['limits'];
}

export const extImages = ['png', 'jpg', 'jpeg', 'gif'];
export const extVideos = ['mp3', 'mp4'];
export const extOthers = ['docx', 'doc', 'xlsx', 'xls', 'pdf'];

export const allowedFileExtensions = [...extImages, ...extVideos, ...extOthers];

export const allowedFileSize = 1024 ** 3;
