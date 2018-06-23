import path from 'path';
import globule from 'globule';
import { log } from './logger';

class ServicesSetup {
  init({ dir, adapter, connector, autoloader }) {
    this.dir = dir;
    this.adapter = adapter;
    this.connector = connector;
    this.autoloader = autoloader;
  }
}

/*
  Feathers Services Autoload
*/
class Services {
  constructor(app) {
    this.app = app;
  }

  init({ dir, connector, adapter, autoloader }) {
    this.dir = path.resolve(dir, 'services');
    this.connector = connector;
    this.adapter = adapter;
    this.db = this.connector(this.app.get('server').db);
    this.autoloader = autoloader;
    this.loadServices();
  }

  loadServices() {
    log.info('------------------------------------------');
    log.info('Loading services...');
    globule
      .find(path.join(this.dir, '*'))
      .map($service => this.autoloader($service));
    log.info('------------------------------------------');
  }
}

const servicesSetup = new ServicesSetup();

export function setupServices($props) {
  servicesSetup.init($props);
}

export function initServices() {
  new Services(this).init(servicesSetup);
}
