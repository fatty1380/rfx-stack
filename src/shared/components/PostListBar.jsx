import React from 'react';
import { observer } from 'mobx-react';
import { dispatch } from 'rfx-core';

import PostSearch from './PostSearch';
import PostFilter from './PostFilter';
import PostInfo from './PostInfo';
import Pagination from './Pagination';

const handlePostPageChange = page => {
  dispatch('posts.page', page);
};

export default observer(({ posts }) => (
  <div className="cf ph4 pt4">
    <div className="fl w-100 w-20-ns tc tl-ns pt3">
      <PostSearch search={posts.searchValue} />
    </div>
    <div className="fl w-100 w-50-ns tc pt3">
      <PostInfo
        itemsFound={posts.pagination.total}
        totalPages={posts.pagination.pages}
        currentPage={posts.pagination.current}
      />
    </div>
    <div className="fl w-60 w-20-ns tl pt3">
      <PostFilter filter={posts.filter} />
    </div>
    <div className="fl w-40 w-10-ns tr pt3">
      <Pagination
        currentPage={posts.pagination.current}
        onPageChange={handlePostPageChange}
      />
    </div>
  </div>
));
