const file = {
  dev: '.env.dev',
  prod: '.env.prod',
};
const configuration = {
  port: +process.env.APP_PORT,
  pathEnv: file.dev,
};
export default configuration;
