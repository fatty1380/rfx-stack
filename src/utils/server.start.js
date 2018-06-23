import getenv from 'getenv';

class ServerSetup {
  init({ config, namespace, logger }) {
    this.config = config;
    this.namespace = namespace;
    this.logger = logger;
  }
}

class ServerStart {
  constructor(app) {
    this.app = app;
    this.fixUA();
  }

  init({ namespace, logger = null }) {
    const key = namespace || 'api';
    const configkey = this.configkey || 'server';
    const config = this.getFeathersConfig(configkey) || this.getEnvConfig(key);
    this.start(config, key, logger);
  }

  start(config, key, logger) {
    this.app
      .listen(config[key.toLowerCase()].port, config[key.toLowerCase()].host)
      .on('listening', () => logger && logger(key));
  }

  getFeathersConfig(configkey) {
    return this.app.get(configkey);
  }

  getEnvConfig(key) {
    return {
      [key.toLowerCase()]: {
        host: getenv([key.toUpperCase(), 'HOST'].join('_')),
        port: getenv([key.toUpperCase(), 'PORT'].join('_')),
      },
    };
  }

  fixUA() {
    // Tell any CSS tooling (such as Material UI) to use
    // "all" vendor prefixes if the user agent is not known.
    global.navigator = global.navigator || {};
    global.navigator.userAgent = global.navigator.userAgent || 'all';
  }
}

const serverSetup = new ServerSetup();

export function setupServer($props) {
  serverSetup.init($props);
}

export function startServer() {
  new ServerStart(this).init(serverSetup);
}
