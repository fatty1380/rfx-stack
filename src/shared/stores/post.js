import _ from 'lodash';
import { observable, action } from 'mobx';

// import { service } from '@/shared/app';

import BaseStore from '@/shared/stores/baseStore';

export default class PostStore extends BaseStore {
  constructor() {
    const baseItem = PostStore.BASE_ITEM;

    super({ serviceName: 'posts', baseItem, searchFields: ['title'] });

    return this;
  }

  static BASE_ITEM = _.extend(BaseStore.BASE_ITEM, {
    title: null,
    completed: null,
  });

  @observable filter = 'all';

  @observable list = [];

  @action
  setSelected(json = {}) {
    return super.setSelected(json);
  }

  @action
  clearSelected() {
    return super.clearSelected();
  }

  /**
   * EVENTS
   *
   * If needed, the realtime event handlers can be overriden or extended by adding
   * logic to the desired method below. The base class will handle all standard
   * operations: adding new items to the list, updating existing items in the list
   * and in the selection, and removing items from the list and deselecting if needed.
   */
  // onCreated = item => { return super.onCreated(item); };
  // onUpdated = data => { return super.onUpdated(data); };
  // onPatched = data => { return super.onPatched(data); };
  // onRemoved = (id, params) => { return super.onRemoved(id, params); };

  /* ACTIONS */

  @action
  filterBy(filter) {
    this.filter = filter;
    let completed;

    switch (this.filter) {
      case 'all':
        this.query.query.completed = undefined;
        break;
      case 'todo':
        completed = false;
        break;
      case 'done':
        completed = true;
        break;
      default:
        completed = 'all';
    }

    if (filter === 'all') return this.find();
    return this.find({ query: { completed } });
  }
}
