import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router';
import { Provider } from 'mobx-react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class App extends Component {
  static fetchData() {
    return Promise.resolve();
  }

  static propTypes = {
    store: PropTypes.object,
    routerProps: PropTypes.object,
  };

  render() {
    const { store, routerProps } = this.props;
    const { ui } = store;
    return (
      <MuiThemeProvider muiTheme={ui.getMui()}>
        <Provider store={store}>
          <Router {...routerProps} />
        </Provider>
      </MuiThemeProvider>
    );
  }
}
