const linkPreviewGenerator = require('link-preview-generator'); // import linkPreviewGenerator from "link-preview-generator";
export const formatString = (str: String): String => {
  return str
    .toLowerCase()
    .replace('_', ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

export const isString = (value: any) => {
  return typeof value === 'string';
};

export const isEmptyInObject = (value: any) => {
  return Object.keys(value).length > 0;
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
