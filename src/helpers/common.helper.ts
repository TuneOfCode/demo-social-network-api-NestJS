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
