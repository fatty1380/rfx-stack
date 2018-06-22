import React from 'react';
import { Switch, Route } from 'react-router-dom';

// Components
import AppLayout from './containers/AppLayout';
import NotFound from './containers/NotFound';

function $import(location, cb, component) {
  return System.import('./containers/' + component) // eslint-disable-line
    .then(module => cb(null, module.default))
    .catch(err => log.error('Dynamic page loading failed', err)); // eslint-disable-line
}

const Layout = (...args) => (
  <AppLayout {...args}>
    <Switch>
      <Route
        path="/auth"
        getComponent={(loc, cb) => $import(loc, cb, 'Auth')}
      />

      <Route
        exact
        path="/messages"
        getComponent={(loc, cb) => $import(loc, cb, 'Messages')}
      />
      <Route
        exact
        path="/messages/(:messageId)"
        getComponent={(loc, cb) => $import(loc, cb, 'Message')}
      />

      <Route
        exact
        path="/packages"
        getComponent={(loc, cb) => $import(loc, cb, 'Packages')}
      />

      <Route
        exact
        path="/"
        getComponent={(loc, cb) => $import(loc, cb, 'Home')}
      />
      <Route path="*" component={NotFound} status={404} />
    </Switch>
  </AppLayout>
);

const App = (...args) => <Route path="/" component={Layout(...args)} />;

export default App;
