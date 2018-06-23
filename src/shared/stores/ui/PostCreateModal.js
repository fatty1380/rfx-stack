import { action, observable } from 'mobx';
import _ from 'lodash';

export default class PostCreateModal {
  @observable isOpen = false;

  // @toggle('open', 'isOpen')
  @action
  open(val) {
    this.isOpen = _.isUndefined(val) ? !this.isOpen : val;
  }
}
