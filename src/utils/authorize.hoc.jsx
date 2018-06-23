import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

/**
  Require Auth HOC
 */
export const authorize = ComposedComponent =>
  observer(
    class Auth extends Component {
      static fetchData(data) {
        if (!data.store.auth.check) {
          return new Promise(resolve => resolve());
        }

        return ComposedComponent.fetchData(data);
      }

      static propTypes = {
        store: PropTypes.object,
        router: PropTypes.object,
        location: PropTypes.object,
      };

      componentWillMount() {
        if (global.TYPE === 'CLIENT') {
          const { store, location, router } = this.props;
          if (!store.auth.check) {
            const currentPath = location.pathname;
            store.auth.redirect = currentPath;
            router.push('/auth');
          }
        }
      }

      render() {
        const { store } = this.props;
        const { auth } = store;
        return auth.check && <ComposedComponent {...this.props} />;
      }
    },
  );
