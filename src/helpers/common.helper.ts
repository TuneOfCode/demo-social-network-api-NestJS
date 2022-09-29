import { UnauthorizedException } from '@nestjs/common';

const linkPreviewGenerator = require('link-preview-generator'); // import linkPreviewGenerator from "link-preview-generator";
export const formatString = (str: String): String => {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

export const isString = (value: any) => {
  return typeof value === 'string';
};

export const isEmptyInObject = (value: any) => {
  return Object.keys(value).length > 0;
};

export const encoded = (value: any) => {
  return Buffer.from(JSON.stringify(value), 'ascii').toString('base64');
};
export const decoded = (valueEncoded: any) => {
  try {
    const dataString = Buffer.from(valueEncoded, 'base64').toString('utf-8');
    const dataObject = JSON.parse(dataString.toString());
    return dataObject;
  } catch (error) {
    throw new UnauthorizedException();
  }
};

export const decodedString = (valueEncoded: any) => {
  return Buffer.from(valueEncoded, 'base64').toString('utf-8');
};

export const getURLInText = (text: string) => {
  const urlRegex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g;
  return urlRegex.exec(text)[0];
};

interface IResultLinkPreview {
  title?: string;
  description?: string;
  domain?: string;
  img?: string;
  favicon?: string;
  linkIframe?: string;
}

export const getLinkPreview = async (url: string) => {
  let data: IResultLinkPreview = await linkPreviewGenerator(url);
  if (data.domain === 'youtube.com') {
    data.linkIframe = `https://www.youtube.com/embed/${url.slice(
      url.indexOf('v=') + 2,
    )}`;
  }
  return data;
};

/**
 * console.log(
    'url in text: ',
    await getLinkPreview(
      getURLInText('Find me at http://github.com and http://www.example.com '),
    ),
  );
 */
