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
  return Object.keys(value).length <= 0;
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
    /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
  return text.match(urlRegex) || [];
};

interface IResultLinkPreview {
  title?: string;
  description?: string;
  domain?: string;
  img?: string;
  favicon?: string;
  linkIframe?: string;
}

export const getLinkPreview = async (text: string) => {
  const urls: string[] = getURLInText(text);
  let data: IResultLinkPreview;
  let index = 0;
  for (let i = 0; i < urls.length; i++) {
    data = await linkPreviewGenerator(urls[i]);
    if (data.domain === 'youtube.com') {
      data.img = `https://i.ytimg.com/vi/${urls[i].slice(
        urls[i].indexOf('v=') + 2,
      )}/hqdefault.jpg`;
      data.linkIframe = `https://www.youtube.com/embed/${urls[i].slice(
        urls[i].indexOf('v=') + 2,
      )}`;
    }
    if (data.img !== null) {
      index = i;
      break;
    }
  }
  return {
    url: urls[index],
    data,
  };
};
