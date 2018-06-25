export default {
  model: 'posts',
  namespace: '/posts',
  options: {
    id: 'uuid',
    paginate: {
      default: 25,
      max: 50,
    },
  },
};
