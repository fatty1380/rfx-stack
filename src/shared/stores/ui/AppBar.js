import { action, observable } from 'mobx';
import _ from 'lodash';

export default class AppBar {
  @observable accountMenuIsOpen = false;

  // @toggle('toggleAccountMenu', 'accountMenuIsOpen')
  @action
  toggleAccountMenu(val) {
    this.accountMenuIsOpen = _.isUndefined(val) ? !this.accountMenuIsOpen : val;
  }
}
