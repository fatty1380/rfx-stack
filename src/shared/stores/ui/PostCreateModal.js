import { action, observable } from 'mobx';

import { init as initForm } from '@/shared/forms/post';

export default class PostCreateModal {
  @observable isOpen = false;

  @action
  setup({ post = {}, open = this.isOpen }) {
    this.isOpen = open;
    this.form = initForm(post);
  }

  @action
  clear() {
    this.isOpen = false;
    this.form.clear();
  }
}
