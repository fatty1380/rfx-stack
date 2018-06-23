import { action, observable } from 'mobx';
import _ from 'lodash';

export default class AppNav {
  @observable isOpen = false;

  @observable isDocked = false;

  // @toggle('open', 'isOpen')
  @action
  open(val) {
    this.isOpen = _.isUndefined(val) ? !this.isOpen : val;
  }

  // @toggle('dock', 'isDocked')
  @action
  dock(val) {
    this.isDocked = _.isUndefined(val) ? !this.isDocked : val;
  }
}
