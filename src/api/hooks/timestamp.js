/* eslint-disable no-param-reassign */
export function timestamp(name) {
  return ({ data }, next) => {
    data[name] = new Date();
    next();
  };
}
