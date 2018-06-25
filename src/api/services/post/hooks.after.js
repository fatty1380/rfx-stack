import hooks from 'feathers-hooks';

/**
  Hook: after
  Service: posts
*/
export default {
  all: [hooks.remove('__v', '_id')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
