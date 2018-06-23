import uuid from 'uuid';

function assignUUID(item) {
  item.uuid = uuid.v4(); // eslint-disable-line no-param-reassign
}

export function setUUID() {
  return ({ data }, next) => {
    if (Array.isArray(data)) {
      data.map(item => assignUUID(item));
      return next();
    }

    assignUUID(data);
    return next();
  };
}
