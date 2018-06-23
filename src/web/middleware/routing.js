import { match } from 'react-router';

const log = logdown.getChildLogger('middleware.routing');

function handleRouter(req, res, props, ssr) {
  log.debug('route:', req.url); // eslint-disable-line no-console
  if (req.url !== '/favicon.ico') ssr(req, res, props);
}

function handleRedirect(res, redirect) {
  res.redirect(302, redirect.pathname + redirect.search);
}

function handleNotFound(res) {
  log.error('route not found', res); // eslint-disable-line no-console
  res.status(404).send('Not Found');
}

function handleError(res, err) {
  log.error('route error:', res, err); // eslint-disable-line no-console
  res.status(500).send(err.message);
}

export function routingMiddleware(routes, ssr) {
  return (req, res) => {
    match({ routes, location: req.url }, (err, redirect, props) => {
      if (err) handleError(res, err);
      else if (redirect) handleRedirect(res, redirect);
      else if (props) handleRouter(req, res, props, ssr);
      else handleNotFound(res);
    });
  };
}
