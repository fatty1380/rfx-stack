import React from 'react';
import { browserHistory } from 'react-router';
import { observer } from 'mobx-react';
import { dispatch } from 'rfx-core';
import $ from '@/shared/styles/_.mixins';

const handleEditPost = post => () => {
  dispatch('ui.postCreateModal.setup', { post, open: true });
};

export default observer(({ post }) => (
  <div className="tc mb4">
    <h3 className="text-center">{post.name || 'Post Details'}</h3>

    <div className="fl t4">
      <button
        type="button"
        value="done"
        onClick={() => browserHistory.push('/messages')}
        className={$.buttonPill}
      >
        <i className="fa fa-chevron-left" /> Messages
      </button>
    </div>

    <div className="fr t4">
      <button
        type="button"
        value="done"
        onClick={handleEditPost(post)}
        className={$.buttonPill}
      >
        <i className="fa fa-edit" /> Edit
      </button>
    </div>
  </div>
));
