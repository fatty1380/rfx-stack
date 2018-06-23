import logdown from 'logdown';
import _ from 'lodash';

const log = logdown(global.TYPE === 'CLIENT' ? 'rfx' : 'ssr');

const logLevel =
  global.logLevel ||
  (global.TYPE === 'CLIENT' && _.get(window, 'localStorage.clientLogLevel')) ||
  'info';

const levels = {
  verbose: /verbose/i.test(logLevel),
  debug: /verbose|debug/i.test(logLevel),
  info: /verbose|debug|info/i.test(logLevel),
  warn: /verbose|debug|info|warn/i.test(logLevel),
  error: /verbose|debug|info|warn|error/i.test(logLevel),
  always: true,
};

initLevels(log, levels);

logdown.getChildLogger = (prefix, opts) => {
  const child = logdown(_.compact([log.opts.prefix, prefix]).join('.'), opts);
  initLevels(child);
  log.verbose(`Initialized Instance of "${child.opts.prefix}" logger`);
  return child;
};

if (global.TYPE === 'CLIENT') {
  window.logdown = logdown;
  window.log = log;
  log.verbose('Initialized **window.log** to `logdown`');
  log.verbose('Log Levels set to: ', JSON.stringify(levels));
} else {
  global.logdown = logdown;
  global.log = log;
  log.verbose('Initialized **global.log** to `logdown`');
  log.verbose('Log Levels set to: ', JSON.stringify(levels));
}

export default logdown;
export { log };

/* eslint-disable no-param-reassign */

function initLevels(logInstance) {
  logInstance.state.isEnabled = true;
  logInstance.always = logInstance.log || logInstance.info;
  logInstance.verbose = levels.verbose ? logInstance.debug : () => null;

  logInstance.debug = levels.debug ? logInstance.debug : () => null;
  logInstance.info = levels.info ? logInstance.info : () => null;
  logInstance.warn = levels.warn ? logInstance.warn : () => null;
  logInstance.error = levels.error ? logInstance.error : () => null;

  if (process.env.NODE_ENV === 'production') {
    logInstance.onError = logInstance.error;

    logInstance.error = (...args) => {
      logInstance.onError(...args);
    };
  }
}
