import log from 'winston';
import getenv from 'getenv';

// set log as cli mode
log.cli();

export const webhost = key =>
  [
    'http://',
    getenv([key.toUpperCase(), 'HOST'].join('_')),
    ':',
    getenv([key.toUpperCase(), 'PORT'].join('_')),
  ].join('');

const logInit = () => {
  log.info('------------------------------------------');
  log.info('--------------- RFX STACK ----------------');
  log.info('------------------------------------------');
};

const logServerAPI = url => {
  const isProd = getenv('NODE_ENV') === 'production';
  const dbHost = isProd ? 'PROD_DB_HOST' : 'DB_HOST';
  const dbName = isProd ? 'PROD_DB_NAME' : 'DB_NAME';
  const dbPort = isProd ? 'PROD_DB_PORT' : 'DB_PORT';
  log.info('API Listening at:', url);
  log.info('Environment:', getenv('NODE_ENV'));
  log.info('------------------------------------------');
  log.info('Database Host:', getenv(dbHost, ''));
  log.info('Database Name:', getenv(dbName, ''));
  log.info('Database Port:', getenv(dbPort, ''));
  log.info('------------------------------------------');
};

const logServerWEB = url => {
  const isProd = getenv('NODE_ENV') === 'production';
  const ioHost = isProd ? 'PROD_IO_HOST' : 'IO_HOST';
  const ioPort = isProd ? 'PROD_IO_PORT' : 'IO_PORT';

  /* global logdown */
  if (logdown) {
    const cl = logdown.getChildLogger('configLogger');
    cl.always(`
\t------------------------------------------
\t**WEB Listening at:** ${url}
\t**Environment:** ${getenv('NODE_ENV')}
\t------------------------------------------
\t**IO Host:** ${getenv(ioHost, '')}
\t**IO Port:** ${getenv(ioPort, '')}
\t------------------------------------------
`);
  } else {
    log.info('WEB Listening at:', url);
    log.info('Environment:', getenv('NODE_ENV'));
    log.info('------------------------------------------');
    log.info('IO Host:', getenv(ioHost, ''));
    log.info('IO Port:', getenv(ioPort, ''));
    log.info('------------------------------------------');
  }
};

export const logServerConfigWebpack = url => [
  'RFX STACK',
  `WEB Listening at: ${webhost(url)}`,
  `Environment: ${getenv('NODE_ENV')}`,
  `IO Host: ${getenv('IO_HOST')}`,
  `IO Port: ${getenv('IO_PORT')}`,
];

export const logServerConfig = (key = null) => {
  logInit();
  const url = webhost(key);
  return key.toUpperCase() === 'API' ? logServerAPI(url) : logServerWEB(url);
};

export { log };
