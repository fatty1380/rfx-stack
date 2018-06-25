import { dispatch } from 'rfx-core';
import Form from './_.extend';

export class PostForm extends Form {
  hooks() {
    return {
      onSuccess(form) {
        const storeAction = `posts.${form.values().uuid ? 'update' : 'create'}`;

        return dispatch(storeAction, { data: form.values() })
          .then(() => dispatch('ui.postCreateModal.clear'))
          .then(() => dispatch('ui.snackBar.open', 'Post Saved.'))
          .catch(err => {
            form.invalidate(err.message);
            dispatch('ui.snackBar.open', err.message);
          });
      },
    };
  }
}

export const fields = {
  title: {
    label: 'Title',
    rules: 'required|string|between:5,50',
  },
  completed: {
    label: 'Completed',
    value: true,
    rules: 'boolean',
  },
  uuid: {
    rules: 'string',
    value: null,
  },
};

export function init(values = {}) {
  return new PostForm({ fields, values });
}

export default new PostForm({ fields });
