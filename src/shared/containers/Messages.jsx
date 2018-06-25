import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { inject, observer } from 'mobx-react';
import { authorize } from '@/utils/authorize.hoc';

// components
import PostListHeader from '@/shared/components/PostListHeader';
import PostListBar from '@/shared/components/PostListBar';
import PostList from '@/shared/components/PostList';
import PostCreateModal from '@/shared/components/PostCreateModal';

// form
import postForm from '@/shared/forms/post';

@inject('store')
@authorize
@observer
export default class Messages extends Component {
  static fetchData({ store }) {
    return store.posts.find();
  }

  static propTypes = {
    store: PropTypes.object,
  };

  render() {
    const { store } = this.props;
    const { ui, posts } = store;

    return (
      <div className="pt5">
        <Helmet title="Message List" />
        <PostListHeader />
        <PostListBar posts={posts} />
        <div className="pa4 _c4">
          <PostList items={posts.list} />
        </div>
        <PostCreateModal open={ui.postCreateModal.isOpen} form={postForm} />
      </div>
    );
  }
}
