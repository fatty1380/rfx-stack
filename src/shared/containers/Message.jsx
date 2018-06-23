import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

// Components
import Helmet from 'react-helmet';
import PostDetailsHeader from '@/shared/components/PostDetailsHeader';
import PostDetails from '@/shared/components/PostDetails';
import PostCreateModal from '@/shared/components/PostCreateModal';
import { authorize } from '@/utils/authorize.hoc';

const log = logdown.getChildLogger('containers.Message');

@inject('store')
@authorize
@observer
export default class Message extends Component {
  static postForm;

  static fetchData({ store, params }) {
    log.debug('Fetching message data for', params.messageId);
    return store.post.get(params.messageId);
  }

  static propTypes = {
    store: PropTypes.object,
  };

  componentWillUnmount() {
    const { store } = this.props;
    return store.post.clear();
  }

  render() {
    const { store } = this.props;
    const { ui, post } = store;

    return (
      <div className="pt5 ph4">
        <Helmet title="Message Details" />
        <PostDetailsHeader post={post.selected} />
        <div className="pv4 _c4">
          <PostDetails item={post.selected} />
        </div>
        <PostCreateModal
          open={ui.postCreateModal.isOpen}
          form={post.editForm}
        />
      </div>
    );
  }
}
