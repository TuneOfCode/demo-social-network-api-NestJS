import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import {
  allowedFileExtensions,
  allowedFileSize,
  extImages,
  extOthers,
  extVideos,
} from 'src/constants/uploadFile.constant';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');

export const filterFileExtension = (
  fileExtensionOrigin: string,
  selectExt: string,
  callback: any,
) => {
  let allowedExtensions: string[] = allowedFileExtensions;
  switch (selectExt) {
    case 'image':
      allowedExtensions = extImages;
      break;
    case 'video':
      allowedExtensions = extVideos;
      break;
    case 'other':
      allowedExtensions = extOthers;
      break;
    case 'image & video':
      allowedExtensions = [...extImages, ...extVideos];
      break;
    case 'image & other':
      allowedExtensions = [...extImages, ...extOthers];
      break;
    case 'video & other':
      allowedExtensions = [...extVideos, ...extOthers];
      break;
    default:
      allowedExtensions = allowedFileExtensions;
  }
  if (!allowedExtensions.includes(fileExtensionOrigin)) {
    return callback(
      new BadRequestException(
        `The file must have the file type: ${allowedExtensions.join(' | ')}`,
      ),
      false,
    );
  }
};

export const storage = (destination: string) =>
  diskStorage({
    destination: destination,
    filename: (req, file, cb) => {
      const fileExtension = path.parse(file.originalname).ext;
      const fileName = uuidv4() + fileExtension;
      cb(null, fileName);
    },
  });

export const fileFilter =
  (selectExt: string) =>
  (req: any, file: Express.Multer.File, callback: any) => {
    const fileExtension = path.parse(file.originalname).ext.substring(1);
    let cb = callback(null, true);
    cb = filterFileExtension(fileExtension, selectExt, callback);
    return cb;
  };
